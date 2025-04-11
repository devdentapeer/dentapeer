import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./libs/mongo";
import Credentials from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import connectToMongoose from "./libs/mongoose";
import User from "./models/User";
import NodeMailer from "next-auth/providers/nodemailer";
import { generateVerificationToken, sendVerificationRequest } from "./libs/nodemailer";
import dbConnect from "./libs/mongoose";

export const authOptions = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { type: "email", label: "Email", required: true },
        password: { type: "password", label: "Password", required: true },
      },
      async authorize(credentials) {
        try {
          // Connect to MongoDB
          await connectToMongoose();

          // Find user by email
          const user = await User.findOne({
            email: credentials.email,
          });
          // If no user found, return null
          if (!user) {
            return null;
          }

          // Check if password matches
          const passwordMatch = await user.comparePassword(
            credentials.password
          );

          if (!passwordMatch) {
            return null;
          }

          return user.toJSON();
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
    NodeMailer({
      server: {
        host: process.env.GOOGLE_SMTP_HOST,
        port: process.env.GOOGLE_SMTP_PORT,
        auth: {
          user: process.env.GOOGLE_SMTP_USER,
          pass: process.env.GOOGLE_SMTP_PASSWORD,
        },
      },
      from: process.env.GOOGLE_SMTP_FROM,
      theme: {
        colorScheme: {
          primary: '#007AFF',
          background: '#ffffff',
          text: '#1e1e1e',
        },
        logo: process.env.NEXT_PUBLIC_APP_LOGO || '',
      },
      generateVerificationToken,
     sendVerificationRequest,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.role = user.role;
        token.id = user.id;
      }

      return token;
    },
    session({ session, token }) {
      
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.email = token.email;

      return session;
    },
    signIn: async ({ user, account, profile, email, credentials  }) => {
      if(account.provider === "nodemailer") {
          await dbConnect();
          const existingUser = await User.findOne({email: user?.email});
          if(!existingUser) {
            return false;
          }
      }
           
      return true;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
    newUser: "/register",
  },

  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

// Export NextAuth function
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
