import bcrypt from "bcryptjs";

const password = "1234";
const hash = bcrypt.hashSync(password, 10);

console.log(hash);
