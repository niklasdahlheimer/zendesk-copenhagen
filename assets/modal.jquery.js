jQuery(document).ready(function ($) {
    function modal(modalSelector, buttonSelector, onOpen) {
        const modal = $(modalSelector);

        // register eventListeners
        $(buttonSelector).click(function (event) {
            event?.preventDefault();
            modal.show();
            onOpen?.();
        });
        $('.close', modal).click(function () {
            modal.hide();
        });
        $(window).click(function (event) {
            if (event.target === modal.get(0)) {
                modal.hide();
            }
        });
        if (window.location.hash === buttonSelector) {
            modal.show();
            onOpen?.();
        }
    }

    function initNewsletter() {
        const closeButton = $('.close');
        const overlay = $("#newsletterModal");
        const newsletterContent = $("#newsletterModalContent");
        const body = $('body');

        const iframe = $('<iframe>', {
            src: 'https://ea.sendcockpit.com/_s.php?&fid=51855&fpw=6facedf588ad3b1ea7b8a098438b3e88',
            id: 'newsletterIFrame',
            frameborder: "no",
            scrolling: 'no',
            allowtransparency: true,
            class: "responsive-iframe",
        })
        newsletterContent.append(iframe)

        body.addClass('no-scroll')

        const closeModal = function () {
            console.log("close modal triggered")
            body.removeClass('no-scroll');
            $("#newsletterIFrame").remove()
            newsletterContent.removeClass('iframe-form-submitted');
        };

        closeButton.on("click", closeModal);
        overlay.on("click", closeModal)

        window.addEventListener("message", (event) => {
            if (event.origin === "https://ea.sendcockpit.com") {
                document.getElementById("newsletterModalContent").classList.add("iframe-form-submitted");
            }
        }, false);
    }


    modal('#newsletterModal', '#newsletter', initNewsletter);
});
