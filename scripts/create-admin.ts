import { createAuthUser } from "../lib/aws/dynamodb";
import bcrypt from "bcryptjs";

async function createAdmin() {
  const email = "mortadagzar@gmail.com";
  const password = "Moma1982#g";
  const name = "Mortada Gzar";

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await createAuthUser({
      email: email.toLowerCase().trim(),
      name,
      passwordHash: hashedPassword,
      authProvider: "credentials",
      createdAt: new Date().toISOString(),
      hasReceivedGreeting: true, // Admin doesn't need greeting
    });

    console.log("✅ Admin account created successfully!");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_EXISTS") {
      console.log("ℹ️  Admin account already exists");
    } else {
      console.error("❌ Error creating admin:", error);
    }
  }
}

createAdmin();
