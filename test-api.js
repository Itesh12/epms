async function testLogin() {

  console.log("Testing Login...");
  const res = await fetch("https://epms-production.up.railway.app/api/v1/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": "https://epms-rust.vercel.app"
    },
    body: JSON.stringify({
      email: "aurumedtech@gmail.com",
      password: "Kruti98."
    })
  });
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text);
}
testLogin();
