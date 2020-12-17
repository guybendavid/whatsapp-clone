const alphabetStringGenerator = () => {
  const charset = "abcdefghijklmnopqrstuvwxyz";
  let result = "";

  for (let i = 0; i < 5; i++) {
    result += charset[Math.floor(Math.random() * charset.length)];
  }

  return result;
};

const alphanumericStringGenerator = () => {
  return Math.random().toString(36).substring(7);
};

describe("Registering a new user", () => {
  it("Should be moving to the register page", () => {
    cy.visit("http://localhost:3000");
    cy.contains("Don't have an account yet?").click();
    cy.url().should("include", "/register");
  });

  // To do: change it to get by label
  // write different test cases for each server response (success failure)
  // replace the check of the string "Keep your phone connected" with a localstorage check / a stronger check

  it("Should be fill out the form", () => {
    const firstName = alphabetStringGenerator();
    cy.get("form > :nth-child(1)").type(firstName);

    const lastName = alphabetStringGenerator();
    cy.get("form > :nth-child(2)").type(lastName);

    const username = alphanumericStringGenerator();
    cy.get("form > :nth-child(3)").type(username);

    const password = alphabetStringGenerator(5);
    cy.get("form > :nth-child(4)").type(password);

    cy.get("button").contains("Register").click();
  });
});