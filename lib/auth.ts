import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getAuthUserByEmail } from "./aws/dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";

// Validate required environment variables
if (!process.env.NEXTAUTH_SECRET) {
  console.warn("⚠️  NEXTAUTH_SECRET is not set. Using a default value for development only.");
}

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      }
    : {}),
});

const docClient = DynamoDBDocumentClient.from(client);
const ADMINS_TABLE = process.env.DYNAMODB_ADMINS_TABLE || "khalele-admins";

async function isAdmin(email: string): Promise<boolean> {
  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: ADMINS_TABLE,
        Key: { email: email.toLowerCase().trim() },
      })
    );
    return !!result.Item;
  } catch {
    return false;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await getAuthUserByEmail(credentials.email);
          if (!user) {
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!isValid) {
            return null;
          }

          return {
            id: user.email,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Auth error during sign-in:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/signin",
    error: "/signin", // Redirect errors to signin page instead of showing error page
  },
  callbacks: {
    async jwt({ token, user }) {
      // Persist user data to token after signin
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      // Send token data to session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        
        // Add role
        const adminStatus = await isAdmin(token.email as string);
        (session.user as { role?: string }).role = adminStatus ? "admin" : "user";
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "development-secret-change-in-production",
};
