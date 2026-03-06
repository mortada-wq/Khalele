import { createAuthUser } from "../lib/aws/dynamodb";
import bcrypt from "bcryptjs";

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || "";
  const password = process.env.ADMIN_PASSWORD || "";
  const name = process.env.ADMIN_NAME || "Admin";

  if (!email || !password) {
    console.error("❌ Set ADMIN_EMAIL and ADMIN_PASSWORD env vars before running");
    process.exit(1);
  }

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
