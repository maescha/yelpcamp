// displays file name(s), if
// there is only one file, name will be inline
//if there are multiple files, names will be on top

(() => {
    "use strict";

    const fileInputs = document.querySelectorAll(".form-input");

    fileInputs.forEach((input) =>
      input.addEventListener("change", function () {
        const files = Array.from(this.files);
        const updatedFiles = files.map((f) =>
          f.name.length > 15
            ? `${f.name.slice(0, 9)}...${f.name.slice(-6)}`
            : f.name
        );
        const fileName = updatedFiles.join(", ");

        const label = this.previousElementSibling;
        // Assumes the label is a previous sibling element
        label.classList.add("selected");

        if (files.length > 1) {
          label.innerHTML = fileName;
        } else {
          label.innerHTML = "Images";
        }
      })
    );
  })();