(function () {
  'use strict';

  // Key map
  const ENTER = 13;
  const ESCAPE = 27;

  function toggleNavigation(toggle, menu) {
    const isExpanded = menu.getAttribute("aria-expanded") === "true";
    menu.setAttribute("aria-expanded", !isExpanded);
    toggle.setAttribute("aria-expanded", !isExpanded);
  }

  function closeNavigation(toggle, menu) {
    menu.setAttribute("aria-expanded", false);
    toggle.setAttribute("aria-expanded", false);
    toggle.focus();
  }

  // Navigation

  window.addEventListener("DOMContentLoaded", () => {
    const menuButton = document.querySelector(".header .menu-button-mobile");
    const menuList = document.querySelector("#user-nav-mobile");

    menuButton.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleNavigation(menuButton, menuList);
    });

    menuList.addEventListener("keyup", (event) => {
      if (event.keyCode === ESCAPE) {
        event.stopPropagation();
        closeNavigation(menuButton, menuList);
      }
    });

    // Toggles expanded aria to collapsible elements
    const collapsible = document.querySelectorAll(
      ".collapsible-nav, .collapsible-sidebar"
    );

    collapsible.forEach((element) => {
      const toggle = element.querySelector(
        ".collapsible-nav-toggle, .collapsible-sidebar-toggle"
      );

      element.addEventListener("click", () => {
        toggleNavigation(toggle, element);
      });

      element.addEventListener("keyup", (event) => {
        console.log("escape");
        if (event.keyCode === ESCAPE) {
          closeNavigation(toggle, element);
        }
      });
    });

    // If multibrand search has more than 5 help centers or categories collapse the list
    const multibrandFilterLists = document.querySelectorAll(
      ".multibrand-filter-list"
    );
    multibrandFilterLists.forEach((filter) => {
      if (filter.children.length > 6) {
        // Display the show more button
        const trigger = filter.querySelector(".see-all-filters");
        trigger.setAttribute("aria-hidden", false);

        // Add event handler for click
        trigger.addEventListener("click", (event) => {
          event.stopPropagation();
          trigger.parentNode.removeChild(trigger);
          filter.classList.remove("multibrand-filter-list--collapsed");
        });
      }
    });
  });

  const isPrintableChar = (str) => {
    return str.length === 1 && str.match(/^\S$/);
  };

  function Dropdown(toggle, menu) {
    this.toggle = toggle;
    this.menu = menu;

    this.menuPlacement = {
      top: menu.classList.contains("dropdown-menu-top"),
      end: menu.classList.contains("dropdown-menu-end"),
    };

    this.toggle.addEventListener("click", this.clickHandler.bind(this));
    this.toggle.addEventListener("keydown", this.toggleKeyHandler.bind(this));
    this.menu.addEventListener("keydown", this.menuKeyHandler.bind(this));
    document.body.addEventListener("click", this.outsideClickHandler.bind(this));

    const toggleId = this.toggle.getAttribute("id") || crypto.randomUUID();
    const menuId = this.menu.getAttribute("id") || crypto.randomUUID();

    this.toggle.setAttribute("id", toggleId);
    this.menu.setAttribute("id", menuId);

    this.toggle.setAttribute("aria-controls", menuId);
    this.menu.setAttribute("aria-labelledby", toggleId);

    this.menu.setAttribute("tabindex", -1);
    this.menuItems.forEach((menuItem) => {
      menuItem.tabIndex = -1;
    });

    this.focusedIndex = -1;
  }

  Dropdown.prototype = {
    get isExpanded() {
      return this.toggle.getAttribute("aria-expanded") === "true";
    },

    get menuItems() {
      return Array.prototype.slice.call(
        this.menu.querySelectorAll("[role='menuitem'], [role='menuitemradio']")
      );
    },

    dismiss: function () {
      if (!this.isExpanded) return;

      this.toggle.removeAttribute("aria-expanded");
      this.menu.classList.remove("dropdown-menu-end", "dropdown-menu-top");
      this.focusedIndex = -1;
    },

    open: function () {
      if (this.isExpanded) return;

      this.toggle.setAttribute("aria-expanded", true);
      this.handleOverflow();
    },

    handleOverflow: function () {
      var rect = this.menu.getBoundingClientRect();

      var overflow = {
        right: rect.left < 0 || rect.left + rect.width > window.innerWidth,
        bottom: rect.top < 0 || rect.top + rect.height > window.innerHeight,
      };

      if (overflow.right || this.menuPlacement.end) {
        this.menu.classList.add("dropdown-menu-end");
      }

      if (overflow.bottom || this.menuPlacement.top) {
        this.menu.classList.add("dropdown-menu-top");
      }

      if (this.menu.getBoundingClientRect().top < 0) {
        this.menu.classList.remove("dropdown-menu-top");
      }
    },

    focusByIndex: function (index) {
      if (!this.menuItems.length) return;

      this.menuItems.forEach((item, itemIndex) => {
        if (itemIndex === index) {
          item.tabIndex = 0;
          item.focus();
        } else {
          item.tabIndex = -1;
        }
      });

      this.focusedIndex = index;
    },

    focusFirstMenuItem: function () {
      this.focusByIndex(0);
    },

    focusLastMenuItem: function () {
      this.focusByIndex(this.menuItems.length - 1);
    },

    focusNextMenuItem: function (currentItem) {
      if (!this.menuItems.length) return;

      const currentIndex = this.menuItems.indexOf(currentItem);
      const nextIndex = (currentIndex + 1) % this.menuItems.length;

      this.focusByIndex(nextIndex);
    },

    focusPreviousMenuItem: function (currentItem) {
      if (!this.menuItems.length) return;

      const currentIndex = this.menuItems.indexOf(currentItem);
      const previousIndex =
        currentIndex <= 0 ? this.menuItems.length - 1 : currentIndex - 1;

      this.focusByIndex(previousIndex);
    },

    focusByChar: function (currentItem, char) {
      char = char.toLowerCase();

      const itemChars = this.menuItems.map((menuItem) =>
        menuItem.textContent.trim()[0].toLowerCase()
      );

      const startIndex =
        (this.menuItems.indexOf(currentItem) + 1) % this.menuItems.length;

      // look up starting from current index
      let index = itemChars.indexOf(char, startIndex);

      // if not found, start from start
      if (index === -1) {
        index = itemChars.indexOf(char, 0);
      }

      if (index > -1) {
        this.focusByIndex(index);
      }
    },

    outsideClickHandler: function (e) {
      if (
        this.isExpanded &&
        !this.toggle.contains(e.target) &&
        !e.composedPath().includes(this.menu)
      ) {
        this.dismiss();
        this.toggle.focus();
      }
    },

    clickHandler: function (event) {
      event.stopPropagation();
      event.preventDefault();

      if (this.isExpanded) {
        this.dismiss();
        this.toggle.focus();
      } else {
        this.open();
        this.focusFirstMenuItem();
      }
    },

    toggleKeyHandler: function (e) {
      const key = e.key;

      switch (key) {
        case "Enter":
        case " ":
        case "ArrowDown":
        case "Down": {
          e.stopPropagation();
          e.preventDefault();

          this.open();
          this.focusFirstMenuItem();
          break;
        }
        case "ArrowUp":
        case "Up": {
          e.stopPropagation();
          e.preventDefault();

          this.open();
          this.focusLastMenuItem();
          break;
        }
        case "Esc":
        case "Escape": {
          e.stopPropagation();
          e.preventDefault();

          this.dismiss();
          this.toggle.focus();
          break;
        }
      }
    },

    menuKeyHandler: function (e) {
      const key = e.key;
      const currentElement = this.menuItems[this.focusedIndex];

      if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }

      switch (key) {
        case "Esc":
        case "Escape": {
          e.stopPropagation();
          e.preventDefault();

          this.dismiss();
          this.toggle.focus();
          break;
        }
        case "ArrowDown":
        case "Down": {
          e.stopPropagation();
          e.preventDefault();

          this.focusNextMenuItem(currentElement);
          break;
        }
        case "ArrowUp":
        case "Up": {
          e.stopPropagation();
          e.preventDefault();
          this.focusPreviousMenuItem(currentElement);
          break;
        }
        case "Home":
        case "PageUp": {
          e.stopPropagation();
          e.preventDefault();
          this.focusFirstMenuItem();
          break;
        }
        case "End":
        case "PageDown": {
          e.stopPropagation();
          e.preventDefault();
          this.focusLastMenuItem();
          break;
        }
        case "Tab": {
          if (e.shiftKey) {
            e.stopPropagation();
            e.preventDefault();
            this.dismiss();
            this.toggle.focus();
          } else {
            this.dismiss();
          }
          break;
        }
        default: {
          if (isPrintableChar(key)) {
            e.stopPropagation();
            e.preventDefault();
            this.focusByChar(currentElement, key);
          }
        }
      }
    },
  };

  // Drodowns

  window.addEventListener("DOMContentLoaded", () => {
    const dropdowns = [];
    const dropdownToggles = document.querySelectorAll(".dropdown-toggle");

    dropdownToggles.forEach((toggle) => {
      const menu = toggle.nextElementSibling;
      if (menu && menu.classList.contains("dropdown-menu")) {
        dropdowns.push(new Dropdown(toggle, menu));
      }
    });
  });

  // Share

  window.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll(".share a");
    links.forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        event.preventDefault();
        window.open(anchor.href, "", "height = 500, width = 500");
      });
    });
  });

  // Vanilla JS debounce function, by Josh W. Comeau:
  // https://www.joshwcomeau.com/snippets/javascript/debounce/
  function debounce(callback, wait) {
    let timeoutId = null;
    return (...args) => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        callback.apply(null, args);
      }, wait);
    };
  }

  // Define variables for search field
  let searchFormFilledClassName = "search-has-value";
  let searchFormSelector = "form[role='search']";

  // Clear the search input, and then return focus to it
  function clearSearchInput(event) {
    event.target
      .closest(searchFormSelector)
      .classList.remove(searchFormFilledClassName);

    let input;
    if (event.target.tagName === "INPUT") {
      input = event.target;
    } else if (event.target.tagName === "BUTTON") {
      input = event.target.previousElementSibling;
    } else {
      input = event.target.closest("button").previousElementSibling;
    }
    input.value = "";
    input.focus();
  }

  // Have the search input and clear button respond
  // when someone presses the escape key, per:
  // https://twitter.com/adambsilver/status/1152452833234554880
  function clearSearchInputOnKeypress(event) {
    const searchInputDeleteKeys = ["Delete", "Escape"];
    if (searchInputDeleteKeys.includes(event.key)) {
      clearSearchInput(event);
    }
  }

  // Create an HTML button that all users -- especially keyboard users --
  // can interact with, to clear the search input.
  // To learn more about this, see:
  // https://adrianroselli.com/2019/07/ignore-typesearch.html#Delete
  // https://www.scottohara.me/blog/2022/02/19/custom-clear-buttons.html
  function buildClearSearchButton(inputId) {
    const button = document.createElement("button");
    button.setAttribute("type", "button");
    button.setAttribute("aria-controls", inputId);
    button.classList.add("clear-button");
    const buttonLabel = window.searchClearButtonLabelLocalized;
    const icon = `<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' focusable='false' role='img' viewBox='0 0 12 12' aria-label='${buttonLabel}'><path stroke='currentColor' stroke-linecap='round' stroke-width='2' d='M3 9l6-6m0 6L3 3'/></svg>`;
    button.innerHTML = icon;
    button.addEventListener("click", clearSearchInput);
    button.addEventListener("keyup", clearSearchInputOnKeypress);
    return button;
  }

  // Append the clear button to the search form
  function appendClearSearchButton(input, form) {
    const searchClearButton = buildClearSearchButton(input.id);
    form.append(searchClearButton);
    if (input.value.length > 0) {
      form.classList.add(searchFormFilledClassName);
    }
  }

  // Add a class to the search form when the input has a value;
  // Remove that class from the search form when the input doesn't have a value.
  // Do this on a delay, rather than on every keystroke.
  const toggleClearSearchButtonAvailability = debounce((event) => {
    const form = event.target.closest(searchFormSelector);
    form.classList.toggle(
      searchFormFilledClassName,
      event.target.value.length > 0
    );
  }, 200);

  // Search

  window.addEventListener("DOMContentLoaded", () => {
    // Set up clear functionality for the search field
    const searchForms = [...document.querySelectorAll(searchFormSelector)];
    const searchInputs = searchForms.map((form) =>
      form.querySelector("input[type='search']")
    );
    searchInputs.forEach((input) => {
      appendClearSearchButton(input, input.closest(searchFormSelector));
      input.addEventListener("keyup", clearSearchInputOnKeypress);
      input.addEventListener("keyup", toggleClearSearchButtonAvailability);
    });
  });

  const key = "returnFocusTo";

  function saveFocus() {
    const activeElementId = document.activeElement.getAttribute("id");
    sessionStorage.setItem(key, "#" + activeElementId);
  }

  function returnFocus() {
    const returnFocusTo = sessionStorage.getItem(key);
    if (returnFocusTo) {
      sessionStorage.removeItem("returnFocusTo");
      const returnFocusToEl = document.querySelector(returnFocusTo);
      returnFocusToEl && returnFocusToEl.focus && returnFocusToEl.focus();
    }
  }

  // Forms

  window.addEventListener("DOMContentLoaded", () => {
    // In some cases we should preserve focus after page reload
    returnFocus();

    // show form controls when the textarea receives focus or back button is used and value exists
    const commentContainerTextarea = document.querySelector(
      ".comment-container textarea"
    );
    const commentContainerFormControls = document.querySelector(
      ".comment-form-controls, .comment-ccs"
    );

    if (commentContainerTextarea) {
      commentContainerTextarea.addEventListener(
        "focus",
        function focusCommentContainerTextarea() {
          commentContainerFormControls.style.display = "block";
          commentContainerTextarea.removeEventListener(
            "focus",
            focusCommentContainerTextarea
          );
        }
      );

      if (commentContainerTextarea.value !== "") {
        commentContainerFormControls.style.display = "block";
      }
    }

    // Expand Request comment form when Add to conversation is clicked
    const showRequestCommentContainerTrigger = document.querySelector(
      ".request-container .comment-container .comment-show-container"
    );
    const requestCommentFields = document.querySelectorAll(
      ".request-container .comment-container .comment-fields"
    );
    const requestCommentSubmit = document.querySelector(
      ".request-container .comment-container .request-submit-comment"
    );

    if (showRequestCommentContainerTrigger) {
      showRequestCommentContainerTrigger.addEventListener("click", () => {
        showRequestCommentContainerTrigger.style.display = "none";
        Array.prototype.forEach.call(requestCommentFields, (element) => {
          element.style.display = "block";
        });
        requestCommentSubmit.style.display = "inline-block";

        if (commentContainerTextarea) {
          commentContainerTextarea.focus();
        }
      });
    }

    // Mark as solved button
    const requestMarkAsSolvedButton = document.querySelector(
      ".request-container .mark-as-solved:not([data-disabled])"
    );
    const requestMarkAsSolvedCheckbox = document.querySelector(
      ".request-container .comment-container input[type=checkbox]"
    );
    const requestCommentSubmitButton = document.querySelector(
      ".request-container .comment-container input[type=submit]"
    );

    if (requestMarkAsSolvedButton) {
      requestMarkAsSolvedButton.addEventListener("click", () => {
        requestMarkAsSolvedCheckbox.setAttribute("checked", true);
        requestCommentSubmitButton.disabled = true;
        requestMarkAsSolvedButton.setAttribute("data-disabled", true);
        requestMarkAsSolvedButton.form.submit();
      });
    }

    // Change Mark as solved text according to whether comment is filled
    const requestCommentTextarea = document.querySelector(
      ".request-container .comment-container textarea"
    );

    const usesWysiwyg =
      requestCommentTextarea &&
      requestCommentTextarea.dataset.helper === "wysiwyg";

    function isEmptyPlaintext(s) {
      return s.trim() === "";
    }

    function isEmptyHtml(xml) {
      const doc = new DOMParser().parseFromString(`<_>${xml}</_>`, "text/xml");
      const img = doc.querySelector("img");
      return img === null && isEmptyPlaintext(doc.children[0].textContent);
    }

    const isEmpty = usesWysiwyg ? isEmptyHtml : isEmptyPlaintext;

    if (requestCommentTextarea) {
      requestCommentTextarea.addEventListener("input", () => {
        if (isEmpty(requestCommentTextarea.value)) {
          if (requestMarkAsSolvedButton) {
            requestMarkAsSolvedButton.innerText =
              requestMarkAsSolvedButton.getAttribute("data-solve-translation");
          }
        } else {
          if (requestMarkAsSolvedButton) {
            requestMarkAsSolvedButton.innerText =
              requestMarkAsSolvedButton.getAttribute(
                "data-solve-and-submit-translation"
              );
          }
        }
      });
    }

    const selects = document.querySelectorAll(
      "#request-status-select, #request-organization-select"
    );

    selects.forEach((element) => {
      element.addEventListener("change", (event) => {
        event.stopPropagation();
        saveFocus();
        element.form.submit();
      });
    });

    // Submit requests filter form on search in the request list page
    const quickSearch = document.querySelector("#quick-search");
    if (quickSearch) {
      quickSearch.addEventListener("keyup", (event) => {
        if (event.keyCode === ENTER) {
          event.stopPropagation();
          saveFocus();
          quickSearch.form.submit();
        }
      });
    }

    // Submit organization form in the request page
    const requestOrganisationSelect = document.querySelector(
      "#request-organization select"
    );

    if (requestOrganisationSelect) {
      requestOrganisationSelect.addEventListener("change", () => {
        requestOrganisationSelect.form.submit();
      });

      requestOrganisationSelect.addEventListener("click", (e) => {
        // Prevents Ticket details collapsible-sidebar to close on mobile
        e.stopPropagation();
      });
    }

    // If there are any error notifications below an input field, focus that field
    const notificationElm = document.querySelector(".notification-error");
    if (
      notificationElm &&
      notificationElm.previousElementSibling &&
      typeof notificationElm.previousElementSibling.focus === "function"
    ) {
      notificationElm.previousElementSibling.focus();
    }
  });

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
          });
          newsletterContent.append(iframe);

          body.addClass('no-scroll');

          const closeModal = function () {
              console.log("close modal triggered");
              body.removeClass('no-scroll');
              $("#newsletterIFrame").remove();
              newsletterContent.removeClass('iframe-form-submitted');
          };

          closeButton.on("click", closeModal);
          overlay.on("click", closeModal);

          window.addEventListener("message", (event) => {
              if (event.origin === "https://ea.sendcockpit.com") {
                  document.getElementById("newsletterModalContent").classList.add("iframe-form-submitted");
              }
          }, false);
      }


      modal('#newsletterModal', '#newsletter', initNewsletter);
  });

  /*!
  * jQuery meanMenu v2.0.8
  * @Copyright (C) 2012-2014 Chris Wharton @ MeanThemes (https://github.com/meanthemes/meanMenu)
  *
  */
  /*
  * This program is free software: you can redistribute it and/or modify
  * it under the terms of the GNU General Public License as published by
  * the Free Software Foundation, either version 3 of the License, or
  * (at your option) any later version.
  *
  * THIS SOFTWARE AND DOCUMENTATION IS PROVIDED "AS IS," AND COPYRIGHT
  * HOLDERS MAKE NO REPRESENTATIONS OR WARRANTIES, EXPRESS OR IMPLIED,
  * INCLUDING BUT NOT LIMITED TO, WARRANTIES OF MERCHANTABILITY OR
  * FITNESS FOR ANY PARTICULAR PURPOSE OR THAT THE USE OF THE SOFTWARE
  * OR DOCUMENTATION WILL NOT INFRINGE ANY THIRD PARTY PATENTS,
  * COPYRIGHTS, TRADEMARKS OR OTHER RIGHTS.COPYRIGHT HOLDERS WILL NOT
  * BE LIABLE FOR ANY DIRECT, INDIRECT, SPECIAL OR CONSEQUENTIAL
  * DAMAGES ARISING OUT OF ANY USE OF THE SOFTWARE OR DOCUMENTATION.
  *
  * You should have received a copy of the GNU General Public License
  * along with this program. If not, see <http://gnu.org/licenses/>.
  *
  * Find more information at http://www.meanthemes.com/plugins/meanmenu/
  *
  */
  (function ($) {
    var blockMenuHeaderScroll = false;
    $(document).ready(function() {

      $(window).on('touchmove', function(e)
      {
        if (blockMenuHeaderScroll)
        {
          e.preventDefault();
        }
      });
    });
  		$.fn.meanmenu = function (options) {
  				var defaults = {
  						meanMenuTarget: jQuery(this), // Target the current HTML markup you wish to replace
  						meanMenuContainer: 'body', // Choose where meanmenu will be placed within the HTML
  						meanMenuClose: "X", // single character you want to represent the close menu button
  						meanMenuCloseSize: "18px", // set font size of close button
  						meanMenuOpen: "<span /><span /><span /><span /><span />", // text/markup you want when menu is closed
  						meanRevealPosition: "right", // left right or center positions
  						meanRevealPositionDistance: "0", // Tweak the position of the menu
  						meanRevealColour: "", // override CSS colours for the reveal background
  						meanScreenWidth: "480", // set the screen width you want meanmenu to kick in at
  						meanNavPush: "", // set a height here in px, em or % if you want to budge your layout now the navigation is missing.
  						meanShowChildren: true, // true to show children in the menu, false to hide them
  						meanExpandableChildren: true, // true to allow expand/collapse children
  						meanExpand: "+", // single character you want to represent the expand for ULs
  						meanContract: "-", // single character you want to represent the contract for ULs
  						meanRemoveAttrs: false, // true to remove classes and IDs, false to keep them
  						onePage: false, // set to true for one page sites
  						meanDisplay: "block", // override display method for table cell based layouts e.g. table-cell
  						removeElements: "" // set to hide page elements
  				};
  				options = $.extend(defaults, options);

  				// get browser width
  				var currentWidth = window.innerWidth || document.documentElement.clientWidth;

  				return this.each(function () {
  						var meanMenu = options.meanMenuTarget;
  						var meanContainer = options.meanMenuContainer;
  						options.meanMenuClose;
  						var meanMenuCloseSize = options.meanMenuCloseSize;
  						var meanMenuOpen = options.meanMenuOpen;
  						var meanRevealPosition = options.meanRevealPosition;
  						var meanRevealPositionDistance = options.meanRevealPositionDistance;
  						var meanRevealColour = options.meanRevealColour;
  						var meanScreenWidth = options.meanScreenWidth;
  						var meanNavPush = options.meanNavPush;
  						var meanRevealClass = ".meanmenu-reveal";
  						var meanShowChildren = options.meanShowChildren;
  						var meanExpandableChildren = options.meanExpandableChildren;
  						var meanExpand = options.meanExpand;
  						var meanContract = options.meanContract;
  						var meanRemoveAttrs = options.meanRemoveAttrs;
  						var onePage = options.onePage;
  						var meanDisplay = options.meanDisplay;
  						var removeElements = options.removeElements;

  						//detect known mobile/tablet usage
  						var isMobile = false;
  						if ( (navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i)) || (navigator.userAgent.match(/iPad/i)) || (navigator.userAgent.match(/Android/i)) || (navigator.userAgent.match(/Blackberry/i)) || (navigator.userAgent.match(/Windows Phone/i)) ) {
  								isMobile = true;
  						}

  						if ( (navigator.userAgent.match(/MSIE 8/i)) || (navigator.userAgent.match(/MSIE 7/i)) ) {
  							// add scrollbar for IE7 & 8 to stop breaking resize function on small content sites
  								jQuery('html').css("overflow-y" , "scroll");
  						}

  						var meanRevealPos = "";
  						var meanCentered = function() {
  							if (meanRevealPosition === "center") {
  								var newWidth = window.innerWidth || document.documentElement.clientWidth;
  								var meanCenter = ( (newWidth/2)-22 )+"px";
  								meanRevealPos = "left:" + meanCenter + ";right:auto;";

  								if (!isMobile) {
  									jQuery('.meanmenu-reveal').css("left",meanCenter);
  								} else {
  									jQuery('.meanmenu-reveal').animate({
  											left: meanCenter
  									});
  								}
  							}
  						};

  						var menuOn = false;
  						var meanMenuExist = false;


  						if (meanRevealPosition === "right") {
  								meanRevealPos = "right:" + meanRevealPositionDistance + ";left:auto;";
  						}
  						if (meanRevealPosition === "left") {
  								meanRevealPos = "left:" + meanRevealPositionDistance + ";right:auto;";
  						}
  						// run center function
  						meanCentered();

  						// set all styles for mean-reveal
  						var $navreveal = "";

  						// re-instate original nav (and call this on window.width functions)
  						var meanOriginal = function() {
  							jQuery('.mean-bar,.mean-push').remove();
  							jQuery(meanContainer).removeClass("mean-container");
  							jQuery(meanMenu).css('display', meanDisplay);
  							menuOn = false;
  							meanMenuExist = false;
  							jQuery(removeElements).removeClass('mean-remove');
  						};

  						// navigation reveal
  						var showMeanMenu = function() {
  								var meanStyles = "background:"+meanRevealColour+";color:"+meanRevealColour+";"+meanRevealPos;
  								if (currentWidth <= meanScreenWidth) {
  								jQuery(removeElements).addClass('mean-remove');
  									meanMenuExist = true;
  									// add class to body so we don't need to worry about media queries here, all CSS is wrapped in '.mean-container'
  									jQuery(meanContainer).addClass("mean-container");
  									jQuery('.mean-container').prepend('<div class="mean-bar"><a href="#nav" class="meanmenu-reveal" style="'+meanStyles+'">Show Navigation</a><nav class="mean-nav"></nav></div>');

  									//push meanMenu navigation into .mean-nav
  									var meanMenuContents = jQuery(meanMenu).html();
  									jQuery('.mean-nav').html(meanMenuContents);

  									// remove all classes from EVERYTHING inside meanmenu nav
  									if(meanRemoveAttrs) {
  										jQuery('nav.mean-nav ul, nav.mean-nav ul *').each(function() {
  											// First check if this has mean-remove class
  											if (jQuery(this).is('.mean-remove')) {
  												jQuery(this).attr('class', 'mean-remove');
  											} else {
  												jQuery(this).removeAttr("class");
  											}
  											jQuery(this).removeAttr("id");
  										});
  									}

  									// push in a holder div (this can be used if removal of nav is causing layout issues)
  									jQuery(meanMenu).before('<div class="mean-push" />');
  									jQuery('.mean-push').css("margin-top",meanNavPush);

  									// hide current navigation and reveal mean nav link
  									jQuery(meanMenu).hide();
  									jQuery(".meanmenu-reveal").show();

  									// turn 'X' on or off
  									jQuery(meanRevealClass).html(meanMenuOpen);
  									$navreveal = jQuery(meanRevealClass);

  									//hide mean-nav ul
  									jQuery('.mean-nav ul').hide();

                    $(".logo-mobile").click(function(e) {
                      e.preventDefault();
                      $("html, body").animate({ scrollTop: 0 }, 500, function() {
                        window.location.hash = "";
                      });
                      jQuery('.mean-nav ul:first').slideUp();
                      menuOn = false;
                      jQuery($navreveal).removeClass("meanclose");
                      $(".mean-bar").removeClass("expanded");
                    });

  									// hide sub nav
  									if(meanShowChildren) {
  											// allow expandable sub nav(s)
  											if(meanExpandableChildren){
  												jQuery('.mean-nav ul ul').each(function() {
  														if(jQuery(this).children().length){
  																jQuery(this,'li:first').parent().append('<a class="mean-expand" href="#" style="font-size: '+ meanMenuCloseSize +'">'+ meanExpand +'</a>');
  														}
  												});
  												jQuery('.mean-expand').on("click",function(e){
  														e.preventDefault();
  															if (jQuery(this).hasClass("mean-clicked")) {
  																	jQuery(this).text(meanExpand);
  																jQuery(this).prev('ul').slideUp(300, function(){});
  														} else {
  																jQuery(this).text(meanContract);
  																jQuery(this).prev('ul').slideDown(300, function(){});
  														}
  														jQuery(this).toggleClass("mean-clicked");
  												});
  											} else {
  													jQuery('.mean-nav ul ul').show();
  											}
  									} else {
  											jQuery('.mean-nav ul ul').hide();
  									}

  									// add last class to tidy up borders
  									jQuery('.mean-nav ul li').last().addClass('mean-last');
  									$navreveal.removeClass("meanclose");
                    $(".mean-bar").removeClass("expanded");
  									jQuery($navreveal).click(function(e){
  										e.preventDefault();
  								    if( menuOn === false ) {
  												jQuery('.mean-nav ul:first').slideDown();
  												menuOn = true;
                          blockMenuHeaderScroll = true;
  										} else {
  											jQuery('.mean-nav ul:first').slideUp();
  											menuOn = false;
                        blockMenuHeaderScroll = false;
  										}
  											$navreveal.toggleClass("meanclose");
                        $(".mean-bar").toggleClass("expanded");

  											jQuery(removeElements).addClass('mean-remove');
  									});

  									// for one page websites, reset all variables...
  									if ( onePage ) {
  										jQuery('.mean-nav ul > li > a:first-child').on( "click" , function () {
  											jQuery('.mean-nav ul:first').slideUp();
  											menuOn = false;
  											jQuery($navreveal).toggleClass("meanclose");
                        $(".mean-bar").removeClass("expanded");
                        blockMenuHeaderScroll = false;

                      });
  									}
  							} else {
  								meanOriginal();
  							}
  						};

  						if (!isMobile) {
  								// reset menu on resize above meanScreenWidth
  								jQuery(window).resize(function () {
  										currentWidth = window.innerWidth || document.documentElement.clientWidth;
  										if (currentWidth > meanScreenWidth) {
  												meanOriginal();
  										} else {
  											meanOriginal();
  										}
  										if (currentWidth <= meanScreenWidth) {
  												showMeanMenu();
  												meanCentered();
  										} else {
  											meanOriginal();
  										}
  								});
  						}

  					jQuery(window).resize(function () {
  								// get browser width
  								currentWidth = window.innerWidth || document.documentElement.clientWidth;

  								if (!isMobile) {
  										meanOriginal();
  										if (currentWidth <= meanScreenWidth) {
  												showMeanMenu();
  												meanCentered();
  										}
  								} else {
  										meanCentered();
  										if (currentWidth <= meanScreenWidth) {
  												if (meanMenuExist === false) {
  														showMeanMenu();
  												}
  										} else {
  												meanOriginal();
  										}
  								}
  						});

  					// run main menuMenu function on load
  					showMeanMenu();
  				});
  		};
  })(jQuery);

  (function($) {

    $.infieldLabel = function(el, options) {

      // To avoid scope issues, use 'base' instead of 'this'
      // to reference this class from internal events and functions.
      var base = this;

      // Access to jQuery and DOM versions of element
      base.$el = $(el);

      // internal variables
      base.$input = null;

      base.init = function() {
        base.options = $.extend({}, $.infieldLabel.defaultOptions, options);
        base.setup();
      };


      /*
        --------------------
        Set up
        --------------------
      */

      // first time input setup
      base.setup = function() {
        base.$input = base.$el.find('input');
        base.$label = base.$el.find('label');

        // hide label if there's already a value
        base.blur();

        // bind events
        base.bind();
      };

      // binds the focus, blur and change events
      base.bind = function() {
        base.$input
          .on('focus.infield', function() {
            base.$el
              .removeClass(base.options.hideClass)
              .addClass(base.options.focusClass);

          }).on('blur.infield change.infield', function() {
            base.blur();
          });

          base.$label.on('click.infield', function() {
            base.$el
              .removeClass(base.options.hideClass)
              .addClass(base.options.focusClass);

            base.$input.focus();
          });
      };

      base.blur = function() {
        if (base.$input.val() !== '') {
          base.$el
            .removeClass(base.options.focusClass)
            .addClass(base.options.hideClass);

        } else {
          base.$el
            .removeClass(base.options.focusClass + ' ' + base.options.hideClass);
        }
      };

      /*
        --------------------
        Initialize
        --------------------
      */
      base.init();
    };


    /*
      --------------------
      Options
      --------------------
    */

    $.infieldLabel.defaultOptions = {
      focusClass: 'placeholder-focus',
      hideClass: 'placeholder-hide'
    };

    $.fn.infieldLabel = function(options) {
      this.each(function() {
        new $.infieldLabel(this, options);
      });
    };

  })(jQuery);

  $(document).ready(function (){

    $(".fixed-menu").meanmenu({
      onePage: false,
      meanScreenWidth: "684"
    });

  });

})();
