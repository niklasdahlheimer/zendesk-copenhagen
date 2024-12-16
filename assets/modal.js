document.addEventListener("DOMContentLoaded", function () {
  function createModal(modalSelector, buttonSelector, onOpen) {
    const modal = document.querySelector(modalSelector);
    const button = document.querySelector(buttonSelector);
    const closeButton = modal.querySelector(".close");

    // register eventListeners
    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        modal.style.display = "block";
        if (onOpen) onOpen();
      });
    }

    if (closeButton) {
      closeButton.addEventListener("click", function () {
        modal.style.display = "none";
      });
    }

    window.addEventListener("click", function (event) {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });

    if (window.location.hash === buttonSelector) {
      modal.style.display = "block";
      if (onOpen) onOpen();
    }
  }

  function initNewsletter() {
    const closeButton = document.querySelector(".close");
    const overlay = document.getElementById("newsletterModal");
    const newsletterContent = document.getElementById("newsletterModalContent");
    const body = document.body;

    const iframe = document.createElement("iframe");
    iframe.src =
      "https://ea.sendcockpit.com/_s.php?&fid=51855&fpw=6facedf588ad3b1ea7b8a098438b3e88";
    iframe.id = "newsletterIFrame";
    iframe.frameBorder = "no";
    iframe.scrolling = "no";
    iframe.allowTransparency = true;
    iframe.className = "responsive-iframe";

    newsletterContent.appendChild(iframe);

    body.classList.add("no-scroll");

    const closeModal = function () {
      body.classList.remove("no-scroll");
      const iframeElement = document.getElementById("newsletterIFrame");
      if (iframeElement) {
        iframeElement.remove();
      }
      newsletterContent.classList.remove("iframe-form-submitted");
    };

    if (closeButton) {
      closeButton.addEventListener("click", closeModal);
    }
    if (overlay) {
      overlay.addEventListener("click", closeModal);
    }

    window.addEventListener(
      "message",
      function (event) {
        if (event.origin === "https://ea.sendcockpit.com") {
          newsletterContent.classList.add("iframe-form-submitted");
        }
      },
      false
    );
  }

  createModal("#newsletterModal", "#newsletter", initNewsletter);
});
