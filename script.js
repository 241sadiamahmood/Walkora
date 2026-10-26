// ===== 1. Product catalogue =====

const products = [
  { id: 1, name: "StreetFlex Runner", price: 4500 },
  { id: 2, name: "Velocity Pro", price: 6200 },
  { id: 3, name: "Urban Classic", price: 3800 },
  { id: 4, name: "ActiveMotion X", price: 5500 },
];

// Each cart item stores a product ID and its quantity.
let cart = [];

// ===== 2. Select HTML elements =====

const cartCount = document.getElementById("cart-count");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartMessage = document.getElementById("cart-message");
const checkoutButton = document.getElementById("checkout-button");

const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

const navigationLinks = document.querySelectorAll(".nav-link");
const addToCartButtons = document.querySelectorAll(".add-to-cart");

// Format prices in Pakistani rupees.
function formatPrice(amount) {
  return "Rs. " + amount.toLocaleString("en-PK");
}

// Look up a product by its ID.
function getProduct(productId) {
  return products.find((product) => product.id === productId);
}

// ===== 3. Add a product to the cart =====

function addToCart(productId) {
  const product = getProduct(productId);

  if (!product) return;

  const existingItem = cart.find((item) => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ productId, quantity: 1 });
  }

  cartMessage.textContent = `${product.name} added to your cart.`;
  updateCart();
}

// Connect every Add to Cart button.
addToCartButtons.forEach((button) => {
  button.addEventListener("click", () => {
    addToCart(Number(button.dataset.productId));
  });
});

// ===== 4. Change item quantities =====

function changeQuantity(productId, amount) {
  const item = cart.find((cartItem) => cartItem.productId === productId);

  if (!item) return;

  item.quantity += amount;

  // Automatically remove an item when its quantity reaches zero.
  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  updateCart();
}

// ===== 5. Remove an item =====

function removeFromCart(productId) {
  const product = getProduct(productId);

  cart = cart.filter((item) => item.productId !== productId);

  if (product) {
    cartMessage.textContent = `${product.name} removed from your cart.`;
  }

  updateCart();
}

// ===== 6. Create cart elements safely =====

// Use textContent for user-visible text and DOM methods rather
// than inserting product strings into HTML markup.
function createCartItem(item) {
  const product = getProduct(item.productId);
  const subtotal = product.price * item.quantity;

  const article = document.createElement("article");
  article.className = "cart-item";

  const details = document.createElement("div");

  const name = document.createElement("div");
  name.className = "cart-item-name";
  name.textContent = product.name;

  const unitPrice = document.createElement("span");
  unitPrice.className = "cart-item-price";
  unitPrice.textContent = `${formatPrice(product.price)} each`;

  const subtotalText = document.createElement("span");
  subtotalText.className = "cart-item-price";
  subtotalText.textContent = `Subtotal: ${formatPrice(subtotal)}`;

  details.append(name, unitPrice, subtotalText);

  const controls = document.createElement("div");
  controls.className = "quantity-controls";
  controls.setAttribute("aria-label", `Quantity for ${product.name}`);

  const decreaseButton = createCartButton(
    "−",
    "decrease",
    product,
    `Decrease ${product.name} quantity`,
  );

  const quantity = document.createElement("span");
  quantity.className = "quantity-number";
  quantity.textContent = item.quantity;
  quantity.setAttribute("aria-label", `Quantity: ${item.quantity}`);

  const increaseButton = createCartButton(
    "+",
    "increase",
    product,
    `Increase ${product.name} quantity`,
  );

  controls.append(decreaseButton, quantity, increaseButton);

  const removeButton = createCartButton(
    "Remove",
    "remove",
    product,
    `Remove ${product.name} from cart`,
  );
  removeButton.className = "remove-button";

  article.append(details, controls, removeButton);

  return article;
}

function createCartButton(text, action, product, label) {
  const button = document.createElement("button");

  button.type = "button";
  button.textContent = text;
  button.dataset.action = action;
  button.dataset.productId = product.id;
  button.setAttribute("aria-label", label);

  if (action === "increase" || action === "decrease") {
    button.className = "quantity-button";
  }

  return button;
}

// ===== 7. Update the cart display and calculations =====

function updateCart() {
  // Count all units, including multiple units of the same product.
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate the total price of all selected products.
  const totalAmount = cart.reduce((sum, item) => {
    const product = getProduct(item.productId);
    return sum + product.price * item.quantity;
  }, 0);

  cartCount.textContent = totalQuantity;
  cartTotal.textContent = formatPrice(totalAmount);
  checkoutButton.disabled = cart.length === 0;

  // Replace the old cart display with the latest state.
  cartItemsContainer.replaceChildren();

  if (cart.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-cart";
    emptyMessage.textContent = "Your cart is empty. Find a pair you love!";

    cartItemsContainer.append(emptyMessage);
    return;
  }

  const fragment = document.createDocumentFragment();

  cart.forEach((item) => {
    fragment.append(createCartItem(item));
  });

  cartItemsContainer.append(fragment);
}

// Event delegation handles buttons recreated during cart updates.
cartItemsContainer.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");

  if (!button || !cartItemsContainer.contains(button)) return;

  const productId = Number(button.dataset.productId);
  const action = button.dataset.action;

  if (action === "increase") {
    changeQuantity(productId, 1);
  } else if (action === "decrease") {
    changeQuantity(productId, -1);
  } else if (action === "remove") {
    removeFromCart(productId);
  }
});

// ===== 8. Demo checkout =====

checkoutButton.addEventListener("click", () => {
  if (cart.length === 0) {
    cartMessage.textContent = "Your cart is empty.";
    return;
  }

  cartMessage.textContent =
    "Demo only: no order or payment has been processed.";
});

// ===== 9. Mobile navigation =====

function closeMobileMenu() {
  navLinks.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open menu");
  menuToggle.querySelector("span").textContent = "☰";
}

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");

  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");

  menuToggle.querySelector("span").textContent = isOpen ? "✕" : "☰";
});

navigationLinks.forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

// ===== 10. Active navigation while scrolling =====

const pageSections = document.querySelectorAll("main section[id]");

function setActiveNavigation(sectionId) {
  navigationLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${sectionId}`;

    link.classList.toggle("active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleSections = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visibleSections.length > 0) {
        setActiveNavigation(visibleSections[0].target.id);
      }
    },
    {
      rootMargin: "-80px 0px -45% 0px",
      threshold: [0, 0.1, 0.25, 0.5, 0.75],
    },
  );

  pageSections.forEach((section) => sectionObserver.observe(section));
} else {
  // Basic fallback for older browsers.
  window.addEventListener("scroll", () => {
    let currentSection = "home";

    pageSections.forEach((section) => {
      if (section.getBoundingClientRect().top < 150) {
        currentSection = section.id;
      }
    });

    setActiveNavigation(currentSection);
  });
}

// Support links that open the page at a specific section.
const initialSection = window.location.hash.slice(1);

if ([...pageSections].some((section) => section.id === initialSection)) {
  setActiveNavigation(initialSection);
} else {
  setActiveNavigation("home");
}

// ===== 11. Contact form demonstration =====

const contactForm = document.getElementById("contact-form");
const contactStatus = document.getElementById("contact-status");

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();

  contactStatus.textContent =
    "Demo only: your message has not been sent. Connect a backend or form service to receive messages.";

  contactForm.reset();
});

// ===== 12. Footer year and initial display =====

document.getElementById("current-year").textContent = new Date().getFullYear();

updateCart();
