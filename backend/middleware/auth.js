import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "eduguard-secret-key-2024";

const DEMO_USERS = {
  u1: { id: "u1", email: "admin@school.edu", role: "admin", name: "Admin User" },
  "demo-admin": { id: "u1", email: "admin@school.edu", role: "admin", name: "Admin User" },
  admin: { id: "u1", email: "admin@school.edu", role: "admin", name: "Admin User" },
  u2: { id: "u2", email: "arjun@school.edu", role: "student", name: "Arjun Patel" },
  "demo-student": { id: "u2", email: "arjun@school.edu", role: "student", name: "Arjun Patel" },
  student: { id: "u2", email: "arjun@school.edu", role: "student", name: "Arjun Patel" },
  u3: { id: "u3", email: "rajesh@school.edu", role: "mentor", name: "Dr. Rajesh Verma" },
  "demo-mentor": { id: "u3", email: "rajesh@school.edu", role: "mentor", name: "Dr. Rajesh Verma" },
  mentor: { id: "u3", email: "rajesh@school.edu", role: "mentor", name: "Dr. Rajesh Verma" },
  u4: { id: "u4", email: "parent@school.edu", role: "parent", name: "Mr. Patel" },
  "demo-parent": { id: "u4", email: "parent@school.edu", role: "parent", name: "Mr. Patel" },
  parent: { id: "u4", email: "parent@school.edu", role: "parent", name: "Mr. Patel" },
};

export const generateToken = (user) => {
  const id = (user._id ? user._id.toString() : user.id) || "u1";
  return jwt.sign(
    { id, email: user.email || "user@school.edu", role: user.role || "admin", name: user.name || "User" },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const verifyToken = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = header.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  // Support demo token prefixes used across mock and dev environments
  if (token.startsWith("demo-token-") || token === "demo-token" || DEMO_USERS[token]) {
    const key = token.replace(/^demo-token-/, "");
    req.user = DEMO_USERS[key] || DEMO_USERS["admin"];
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Fallback: If JWT verification fails but header provided, fallback to admin in dev/demo environment
    return res.status(401).json({ error: "Invalid token" });
  }
};

