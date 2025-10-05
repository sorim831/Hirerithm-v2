const fs = require("fs");
const path = require("path");

const inputDir = path.resolve(__dirname, "../output_json");

fs.readdirSync(inputDir).forEach((file) => {
  const filePath = path.join(inputDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const updatedData = data.map((entry) => {
    const comments = [];
    if (entry.comment1) comments.push(entry.comment1);
    if (entry.comment2) comments.push(entry.comment2);

    return {
      ...entry,
      comments,
    };
  });

  fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2), "utf-8");
});
