
// ===== عناصر الصفحة =====

const buttons = document.querySelectorAll(
    ".product-card button"
);

const cartItems = document.querySelector("#cart-items");

const cartCount = document.querySelector("#cart-count");

const navCartCount = document.querySelector(
    "#nav-cart-count"
);

const clearCart = document.querySelector("#clear-cart");

const orderForm = document.querySelector("#order-form");

const orderMessage = document.querySelector(
    "#order-message"
);


// ===== رقم واتساب المتجر =====
// احتفظ برقمك الذي أدخلته سابقًا

const storePhone = "967776482720";


// ===== قراءة السلة المحفوظة =====

const availableProducts = [
    "ساعة كلاسيكية",
    "عطر فاخر",
    "سوار أنيق"
];

let cart = [];

try {

    const savedCart = JSON.parse(
        localStorage.getItem("lamaCart")
    );

    if (Array.isArray(savedCart)) {

        const validItems = savedCart.filter(item =>
            item &&
            availableProducts.includes(item.name) &&
            Number.isSafeInteger(item.quantity) &&
            item.quantity > 0
        );

        // دمج المنتجات المتكررة إن وجدت
        availableProducts.forEach(function(name) {

            const quantity = validItems
                .filter(item => item.name === name)
                .reduce(
                    (sum, item) => sum + item.quantity,
                    0
                );

            if (
                quantity > 0 &&
                Number.isSafeInteger(quantity)
            ) {
                cart.push({
                    name: name,
                    quantity: quantity
                });
            }

        });

    }

} catch (error) {

    console.log("تعذر قراءة السلة المحفوظة");

}


// ===== حفظ السلة =====

function saveCart() {

    try {
        localStorage.setItem(
            "lamaCart",
            JSON.stringify(cart)
        );
    } catch (error) {
        console.log("تعذر حفظ السلة");
    }

}


// ===== إضافة منتج إلى السلة =====

function addToCart(productName) {

    if (!availableProducts.includes(productName)) {
        return;
    }

    const existingProduct = cart.find(
        item => item.name === productName
    );

    if (existingProduct) {

        if (
            existingProduct.quantity >=
            Number.MAX_SAFE_INTEGER
        ) {
            return;
        }

        existingProduct.quantity++;

    } else {

        cart.push({
            name: productName,
            quantity: 1
        });

    }

    saveCart();
    displayCart();

}


// ===== تغيير كمية المنتج =====

function changeQuantity(productName, amount) {

    const product = cart.find(
        item => item.name === productName
    );

    if (!product) {
        return;
    }

    const newQuantity = product.quantity + amount;

    if (newQuantity <= 0) {

        cart = cart.filter(
            item => item.name !== productName
        );

    } else if (Number.isSafeInteger(newQuantity)) {

        product.quantity = newQuantity;

    }

    saveCart();
    displayCart();

}


// ===== إنشاء زر باستخدام JavaScript =====

function makeButton(label, action) {

    const button = document.createElement("button");

    button.type = "button";
    button.textContent = label;

    button.addEventListener("click", action);

    return button;

}


// ===== عرض محتويات السلة =====

function displayCart() {

    cartItems.replaceChildren();

    let totalQuantity = 0;

    if (cart.length === 0) {

        const emptyMessage = document.createElement("p");

        emptyMessage.textContent = "السلة فارغة حاليًا.";

        cartItems.appendChild(emptyMessage);

    }

    cart.forEach(function(product) {

        totalQuantity += product.quantity;

        const row = document.createElement("div");

        row.className = "cart-item";


        // اسم المنتج
        const name = document.createElement("span");

        name.textContent = product.name;


        // عدد القطع
        const quantity = document.createElement("span");

        quantity.textContent =
            "الكمية: " + product.quantity;


        // زر الزيادة
        const increase = makeButton("+", function() {

            changeQuantity(product.name, 1);

        });


        // زر النقصان
        const decrease = makeButton("-", function() {

            changeQuantity(product.name, -1);

        });


        // زر الحذف
        const remove = makeButton("حذف", function() {

            cart = cart.filter(
                item => item.name !== product.name
            );

            saveCart();
            displayCart();

        });


        row.append(
            name,
            quantity,
            increase,
            decrease,
            remove
        );

        cartItems.appendChild(row);

    });


    // تحديث عدد القطع
    cartCount.textContent =
        "عدد القطع: " + totalQuantity;

    navCartCount.textContent = totalQuantity;

}


// ===== ربط أزرار المنتجات بالسلة =====

buttons.forEach(function(button) {

    button.addEventListener("click", function() {

        const card = button.closest(".product-card");

        const productName = card.querySelector(
            "h3"
        ).textContent.trim();

        addToCart(productName);

    });

});


// ===== تفريغ السلة =====

clearCart.addEventListener("click", function() {

    cart = [];

    saveCart();

    displayCart();

    orderMessage.textContent = "";

});


// ===== تجهيز طلب واتساب =====

orderForm.addEventListener("submit", function(event) {

    event.preventDefault();

    if (cart.length === 0) {

        orderMessage.textContent =
            "السلة فارغة! أضف منتجًا أولًا.";

        return;

    }


    const customerName = document.querySelector(
        "#customer-name"
    ).value.trim();

    const customerPhone = document.querySelector(
        "#customer-phone"
    ).value.trim();


    if (!customerName) {

        orderMessage.textContent =
            "يرجى كتابة اسم العميل.";

        return;

    }


    // نص رسالة واتساب
    let message = "استفسار جديد من متجر لمعة\n\n";

    message += "الاسم: " + customerName + "\n";

    if (customerPhone) {

        message += "الهاتف: " + customerPhone + "\n";

    }

    message += "\nالمنتجات المطلوبة:\n";


    cart.forEach(function(product) {

        message +=
            "- " + product.name +
            " | الكمية: " +
            product.quantity + "\n";

    });


    message +=
        "\nهذا استفسار عن التوفر والأسعار.";


    // إنشاء رابط واتساب
    const whatsappUrl =
        "https://wa.me/" + storePhone +
        "?text=" + encodeURIComponent(message);


    // فتح واتساب
    const openedWindow = window.open(
        whatsappUrl,
        "_blank"
    );

    if (openedWindow) {

        openedWindow.opener = null;

        orderMessage.textContent =
            "تم تجهيز الاستفسار. أكمل إرسال الرسالة في واتساب.";

    } else {

        orderMessage.textContent =
            "تعذر فتح واتساب تلقائيًا. تحقق من إعدادات النوافذ المنبثقة.";

    }

});


// ===== تشغيل السلة عند فتح الموقع =====

displayCart();
