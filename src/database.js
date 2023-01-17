const mongoose = require("mongoose");

mongoose.set("strictQuery", false); // avoid warning message

mongoose
  .connect("mongodb://admin:password@localhost:27017", { dbName: "power" })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

// déclaration d'un schema
let userSchema = mongoose.Schema(
  {
    name: String,
  },
  {
    collection: "user",
  }
);

// // déclaration du modèle
let User = mongoose.model("User", userSchema);

// // export du modèle pour utilisation ailleurs dans l'application
module.exports = User;
