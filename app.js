// Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// DOM Elements
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const mobileLoginBtn = document.getElementById('mobileLoginBtn');
const mobileSignupBtn = document.getElementById('mobileSignupBtn');
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const profileModal = document.getElementById('profileModal');
const sellerModal = document.getElementById('sellerModal');
const closeModalBtns = document.querySelectorAll('.close-modal');
const showSignup = document.getElementById('showSignup');
const showLogin = document.getElementById('showLogin');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const userProfile = document.querySelector('.user-profile');
const logoutBtn = document.getElementById('logoutBtn');
const viewProfileBtn = document.getElementById('viewProfile');
const sellerDashboardBtn = document.getElementById('sellerDashboard');
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const profileType = document.getElementById('profileType');
const profileJoined = document.getElementById('profileJoined');
const profilePicture = document.getElementById('profilePicture');
const profileUpload = document.getElementById('profileUpload');
const uploadProfileBtn = document.getElementById('uploadProfileBtn');
const becomeSellerBtn = document.getElementById('becomeSellerBtn');
const sellerTabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const addProductForm = document.getElementById('addProductForm');
const imagePreview = document.getElementById('imagePreview');
const productImages = document.getElementById('productImages');
const categoriesScroll = document.querySelector('.categories-scroll');
const leftScrollBtn = document.querySelector('.left-scroll');
const rightScrollBtn = document.querySelector('.right-scroll');
const featuredProductsGrid = document.getElementById('featuredProducts');
const offerProductsGrid = document.getElementById('offerProducts');
const newArrivalProductsGrid = document.getElementById('newArrivalProducts');
const enLangBtn = document.getElementById('enLang');
const amLangBtn = document.getElementById('amLang');
const omLangBtn = document.getElementById('omLang');
const currentYear = document.getElementById('currentYear');

// Current year in footer
currentYear.textContent = new Date().getFullYear();

// Mobile Menu Toggle
mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
    });
});

// Modal Functions
function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Event Listeners for Modals
loginBtn.addEventListener('click', () => openModal(loginModal));
signupBtn.addEventListener('click', () => openModal(signupModal));
mobileLoginBtn.addEventListener('click', () => {
    openModal(loginModal);
    mobileMenu.classList.remove('active');
});
mobileSignupBtn.addEventListener('click', () => {
    openModal(signupModal);
    mobileMenu.classList.remove('active');
});
showSignup.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal(loginModal);
    openModal(signupModal);
});
showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal(signupModal);
    openModal(loginModal);
});
viewProfileBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(profileModal);
});
sellerDashboardBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(sellerModal);
});

closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const modal = btn.closest('.modal');
        closeModal(modal);
    });
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target);
    }
});

// Auth State Listener
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in
        document.querySelector('.auth-buttons').classList.add('hidden');
        userProfile.classList.remove('hidden');
        
        // Load user data
        loadUserProfile(user);
        
        // Check if user is a seller
        checkSellerStatus(user.uid);
    } else {
        // User is signed out
        document.querySelector('.auth-buttons').classList.remove('hidden');
        userProfile.classList.add('hidden');
    }
});

// Login Function
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            closeModal(loginModal);
            loginForm.reset();
        })
        .catch(error => {
            alert(error.message);
        });
});

// Signup Function
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const isSeller = document.getElementById('sellerCheckbox').checked;
    
    if (password !== confirmPassword) {
        alert("Passwords don't match!");
        return;
    }
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Add user to Firestore
            return db.collection('users').doc(userCredential.user.uid).set({
                name: name,
                email: email,
                isSeller: isSeller,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            closeModal(signupModal);
            signupForm.reset();
        })
        .catch(error => {
            alert(error.message);
        });
});

// Logout Function
logoutBtn.addEventListener('click', () => {
    auth.signOut()
        .then(() => {
            closeModal(profileModal);
        })
        .catch(error => {
            alert(error.message);
        });
});

// Load User Profile
function loadUserProfile(user) {
    db.collection('users').doc(user.uid).get()
        .then(doc => {
            if (doc.exists) {
                const userData = doc.data();
                profileName.textContent = userData.name;
                profileEmail.textContent = user.email;
                profileType.textContent = userData.isSeller ? 'Seller' : 'Buyer';
                profileJoined.textContent = userData.createdAt ? userData.createdAt.toDate().toLocaleDateString() : 'N/A';
                
                // Show/hide become seller button
                if (!userData.isSeller) {
                    becomeSellerBtn.classList.remove('hidden');
                } else {
                    becomeSellerBtn.classList.add('hidden');
                }
                
                // Load profile picture if exists
                if (userData.profilePicture) {
                    profilePicture.src = userData.profilePicture;
                    document.getElementById('profileImg').src = userData.profilePicture;
                }
            }
        })
        .catch(error => {
            console.error("Error loading user profile:", error);
        });
}

// Check Seller Status
function checkSellerStatus(userId) {
    db.collection('users').doc(userId).get()
        .then(doc => {
            if (doc.exists && doc.data().isSeller) {
                // User is a seller
                loadSellerProducts(userId);
                loadSellerOrders(userId);
                loadSellerAnalytics(userId);
            }
        });
}

// Become a Seller
becomeSellerBtn.addEventListener('click', () => {
    const user = auth.currentUser;
    if (user) {
        db.collection('users').doc(user.uid).update({
            isSeller: true
        })
        .then(() => {
            alert("You are now a seller!");
            loadUserProfile(user);
            checkSellerStatus(user.uid);
        })
        .catch(error => {
            alert(error.message);
        });
    }
});

// Upload Profile Picture
uploadProfileBtn.addEventListener('click', () => {
    profileUpload.click();
});

profileUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const user = auth.currentUser;
    
    if (file && user) {
        const storageRef = storage.ref(`profile_pictures/${user.uid}`);
        const uploadTask = storageRef.put(file);
        
        uploadTask.on('state_changed',
            (snapshot) => {
                // Progress monitoring can be added here
            },
            (error) => {
                alert(error.message);
            },
            () => {
                // Upload completed successfully
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    // Update user profile with the new photo URL
                    db.collection('users').doc(user.uid).update({
                        profilePicture: downloadURL
                    })
                    .then(() => {
                        profilePicture.src = downloadURL;
                        document.getElementById('profileImg').src = downloadURL;
                    });
                });
            }
        );
    }
});

// Seller Dashboard Tabs
sellerTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabId = tab.getAttribute('data-tab');
        
        // Update active tab
        sellerTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update active content
        tabContents.forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabId}Tab`).classList.add('active');
    });
});

// Load Seller Products
function loadSellerProducts(userId) {
    const productsList = document.getElementById('sellerProductsList');
    productsList.innerHTML = '';
    
    db.collection('products').where('sellerId', '==', userId).get()
        .then(querySnapshot => {
            if (querySnapshot.empty) {
                productsList.innerHTML = '<p>No products found</p>';
                return;
            }
            
            querySnapshot.forEach(doc => {
                const product = doc.data();
                productsList.innerHTML += `
                    <div class="seller-product" data-id="${doc.id}">
                        <img src="${product.images[0]}" alt="${product.name}">
                        <div class="seller-product-info">
                            <div class="seller-product-title">${product.name}</div>
                            <div class="seller-product-price">${product.price} ETB</div>
                            <div>Stock: ${product.stock}</div>
                        </div>
                        <div class="seller-product-actions">
                            <button class="edit-product">Edit</button>
                            <button class="delete-product">Delete</button>
                        </div>
                    </div>
                `;
            });
            
            // Add event listeners for edit/delete buttons
            document.querySelectorAll('.delete-product').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const productId = e.target.closest('.seller-product').getAttribute('data-id');
                    if (confirm('Are you sure you want to delete this product?')) {
                        db.collection('products').doc(productId).delete()
                            .then(() => {
                                loadSellerProducts(userId);
                            });
                    }
                });
            });
        });
}

// Load Seller Orders
function loadSellerOrders(userId) {
    const ordersList = document.getElementById('sellerOrdersList');
    ordersList.innerHTML = '';
    
    // In a real app, you would query orders that include the seller's products
    // This is a simplified version
    db.collection('orders').where('sellerId', '==', userId).get()
        .then(querySnapshot => {
            if (querySnapshot.empty) {
                ordersList.innerHTML = '<p>No orders found</p>';
                return;
            }
            
            querySnapshot.forEach(doc => {
                const order = doc.data();
                ordersList.innerHTML += `
                    <div class="order-item">
                        <div class="order-header">
                            <div class="order-id">Order #${doc.id.substring(0, 8)}</div>
                            <div class="order-status status-${order.status}">${order.status}</div>
                        </div>
                        <div class="order-date">${order.createdAt.toDate().toLocaleString()}</div>
                        <div class="order-product">
                            <img src="${order.items[0].image}" alt="${order.items[0].name}">
                            <div class="order-product-info">
                                <div class="order-product-title">${order.items[0].name}</div>
                                <div class="order-product-price">${order.items[0].price} ETB x ${order.items[0].quantity}</div>
                            </div>
                        </div>
                        <div class="order-footer">
                            <div class="order-total">Total: ${order.total} ETB</div>
                            <div class="order-actions">
                                <button class="update-status">Update Status</button>
                                <button class="view-details">View Details</button>
                            </div>
                        </div>
                    </div>
                `;
            });
        });
}

// Load Seller Analytics
function loadSellerAnalytics(userId) {
    // In a real app, you would calculate these from orders data
    document.getElementById('totalSales').textContent = '0 ETB';
    document.getElementById('totalOrders').textContent = '0';
    document.getElementById('productsSold').textContent = '0';
    
    // Chart.js implementation would go here
    const ctx = document.getElementById('salesChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Sales',
                data: [0, 0, 0, 0, 0, 0],
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 2,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Add Product Form
addProductForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    
    if (!user) return;
    
    const name = document.getElementById('productName').value;
    const description = document.getElementById('productDescription').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const category = document.getElementById('productCategory').value;
    const stock = parseInt(document.getElementById('productStock').value);
    const files = productImages.files;
    
    if (files.length === 0) {
        alert('Please upload at least one product image');
        return;
    }
    
    // Upload images first
    const uploadPromises = [];
    const imageUrls = [];
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const storageRef = storage.ref(`products/${user.uid}/${Date.now()}_${file.name}`);
        uploadPromises.push(
            storageRef.put(file).then(snapshot => snapshot.ref.getDownloadURL())
        );
    }
    
    Promise.all(uploadPromises)
        .then(urls => {
            imageUrls.push(...urls);
            
            // Save product data to Firestore
            return db.collection('products').add({
                name: name,
                description: description,
                price: price,
                category: category,
                stock: stock,
                images: imageUrls,
                sellerId: user.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                featured: false
            });
        })
        .then(() => {
            alert('Product added successfully!');
            addProductForm.reset();
            imagePreview.innerHTML = '';
            loadSellerProducts(user.uid);
        })
        .catch(error => {
            alert(error.message);
        });
});

// Product Image Preview
productImages.addEventListener('change', (e) => {
    imagePreview.innerHTML = '';
    const files = e.target.files;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        
        reader.onload = (e) => {
            imagePreview.innerHTML += `
                <div class="image-preview-item">
                    <img src="${e.target.result}" alt="Preview">
                    <span class="remove-image">&times;</span>
                </div>
            `;
        };
        
        reader.readAsDataURL(file);
    }
    
    // Remove image preview
    imagePreview.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-image')) {
            e.target.parentElement.remove();
            
            // Update files list (simplified approach)
            // In a real app, you would need to handle the FileList properly
        }
    });
});

// Categories Horizontal Scroll
leftScrollBtn.addEventListener('click', () => {
    categoriesScroll.scrollBy({
        left: -200,
        behavior: 'smooth'
    });
});

rightScrollBtn.addEventListener('click', () => {
    categoriesScroll.scrollBy({
        left: 200,
        behavior: 'smooth'
    });
});

// Load Featured Products
function loadFeaturedProducts() {
    featuredProductsGrid.innerHTML = '';
    
    db.collection('products').where('featured', '==', true).limit(8).get()
        .then(querySnapshot => {
            if (querySnapshot.empty) {
                featuredProductsGrid.innerHTML = '<p>No featured products found</p>';
                return;
            }
            
            querySnapshot.forEach(doc => {
                const product = doc.data();
                featuredProductsGrid.innerHTML += createProductCard(product, doc.id);
            });
        });
}

// Load Offer Products
function loadOfferProducts() {
    offerProductsGrid.innerHTML = '';
    
    // In a real app, you would query products with discounts/offers
    db.collection('products').limit(8).get()
        .then(querySnapshot => {
            if (querySnapshot.empty) {
                offerProductsGrid.innerHTML = '<p>No offer products found</p>';
                return;
            }
            
            querySnapshot.forEach(doc => {
                const product = doc.data();
                // Add a fake discount for demo
                product.oldPrice = product.price * 1.2;
                offerProductsGrid.innerHTML += createProductCard(product, doc.id, true);
            });
        });
}

// Load New Arrival Products
function loadNewArrivalProducts() {
    newArrivalProductsGrid.innerHTML = '';
    
    db.collection('products').orderBy('createdAt', 'desc').limit(8).get()
        .then(querySnapshot => {
            if (querySnapshot.empty) {
                newArrivalProductsGrid.innerHTML = '<p>No new products found</p>';
                return;
            }
            
            querySnapshot.forEach(doc => {
                const product = doc.data();
                newArrivalProductsGrid.innerHTML += createProductCard(product, doc.id);
            });
        });
}

// Create Product Card HTML
function createProductCard(product, id, isOffer = false) {
    return `
        <div class="product-card" data-id="${id}">
            ${isOffer ? '<span class="product-badge" data-i18n="offer">Offer</span>' : ''}
            <img src="${product.images[0]}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <div class="product-title">${product.name}</div>
                <div class="product-price">
                    ${isOffer ? `<span class="old-price">${product.oldPrice.toFixed(2)} ETB</span> ` : ''}
                    ${product.price} ETB
                </div>
                <div class="product-rating">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star-half-alt"></i>
                    <span>(24)</span>
                </div>
                <div class="product-actions">
                    <button class="add-to-cart" data-i18n="addToCart">Add to Cart</button>
                    <button class="wishlist-btn"><i class="far fa-heart"></i></button>
                </div>
            </div>
        </div>
    `;
}

// Load initial data
loadFeaturedProducts();
loadOfferProducts();
loadNewArrivalProducts();

// Internationalization (i18n)
const translations = {
    en: {
        home: "Home",
        featured: "Featured",
        categories: "Categories",
        offers: "Offers",
        newArrivals: "New Arrivals",
        services: "Services",
        blogs: "Blogs",
        login: "Login",
        signup: "Sign Up",
        heroTitle: "Discover Amazing Products",
        heroSubtitle: "Shop from thousands of sellers across Ethiopia",
        shopNow: "Shop Now",
        shopCategories: "Shop by Categories",
        electronics: "Electronics",
        fashion: "Fashion",
        homeGarden: "Home & Garden",
        beauty: "Beauty",
        sports: "Sports",
        books: "Books",
        toys: "Toys",
        grocery: "Grocery",
        featuredProducts: "Featured Products",
        holidayOffers: "Holiday Special Offers",
        specialDiscount: "Up to 50% OFF",
        limitedTime: "Limited time offer for holiday season",
        newArrivals: "New Arrivals",
        ourServices: "Our Services",
        fastDelivery: "Fast Delivery",
        fastDeliveryDesc: "Get your products delivered within 1-3 days",
        easyReturns: "Easy Returns",
        easyReturnsDesc: "30-day return policy for most items",
        customerSupport: "24/7 Support",
        customerSupportDesc: "Our team is always here to help you",
        securePayment: "Secure Payment",
        securePaymentDesc: "Your transactions are always protected",
        blogsInsights: "Blogs & Insights",
        blogTitle1: "How to Choose the Right Product",
        blogExcerpt1: "Tips for selecting the best products for your needs...",
        blogTitle2: "E-Commerce Trends in 2023",
        blogExcerpt2: "Discover the latest trends shaping online shopping...",
        blogTitle3: "Sustainable Shopping Guide",
        blogExcerpt3: "Learn how to make environmentally friendly purchases...",
        readMore: "Read More",
        aboutUs: "About Us",
        aboutDesc: "EthioMarket is Ethiopia's leading e-commerce platform connecting buyers and sellers across the country.",
        quickLinks: "Quick Links",
        contactUs: "Contact Us",
        newsletter: "Newsletter",
        emailPlaceholder: "Your Email",
        subscribe: "Subscribe",
        allRightsReserved: "All rights reserved",
        profile: "Profile",
        sellerDashboard: "Seller Dashboard",
        logout: "Logout",
        fullName: "Full Name",
        password: "Password",
        confirmPassword: "Confirm Password",
        registerAsSeller: "Register as a seller",
        noAccount: "Don't have an account?",
        haveAccount: "Already have an account?",
        userProfile: "User Profile",
        uploadPhoto: "Upload Photo",
        accountType: "Account Type",
        joinedDate: "Joined",
        editProfile: "Edit Profile",
        viewOrders: "View Orders",
        becomeSeller: "Become a Seller",
        myProducts: "My Products",
        addProduct: "Add Product",
        orders: "Orders",
        analytics: "Analytics",
        productName: "Product Name",
        description: "Description",
        price: "Price (ETB)",
        category: "Category",
        selectCategory: "Select Category",
        stock: "Stock Quantity",
        productImages: "Product Images",
        offer: "Offer",
        addToCart: "Add to Cart"
    },
    am: {
        home: "መነሻ",
        featured: "የተለዩ",
        categories: "ምድቦች",
        offers: "ቅናሾች",
        newArrivals: "አዲስ የመጡ",
        services: "አገልግሎቶች",
        blogs: "ብሎጎች",
        login: "ግባ",
        signup: "ይመዝገቡ",
        heroTitle: "የሚያምሩ ምርቶችን ይፈልጉ",
        heroSubtitle: "በመላው ኢትዮጵያ ከሺህ የሚቆጠሩ ሻጮች ይግዙ",
        shopNow: "አሁን ይግዙ",
        shopCategories: "በምድብ ይግዙ",
        electronics: "ኤሌክትሮኒክስ",
        fashion: "ፋሽን",
        homeGarden: "ቤት እና የተክል አትክልት",
        beauty: "ውበት",
        sports: "ስፖርት",
        books: "መጻሕፍት",
        toys: "መጫወቻዎች",
        grocery: "ሻንጣ",
        featuredProducts: "የተለዩ ምርቶች",
        holidayOffers: "የበዓል ልዩ ቅናሾች",
        specialDiscount: "እስከ 50% ቅናሽ",
        limitedTime: "ለበዓሉ ወቅት የተወሰነ ጊዜ ቅናሽ",
        newArrivals: "አዲስ የመጡ ምርቶች",
        ourServices: "የእኛ አገልግሎቶች",
        fastDelivery: "ፈጣን አቅራቢያ",
        fastDeliveryDesc: "ምርቶችዎን በ1-3 ቀናት ውስጥ ይቀበሉ",
        easyReturns: "ቀላል መመለሻ",
        easyReturnsDesc: "ለአብዛኛዎቹ እቃዎች 30-ቀን የመመለሻ ፖሊሲ",
        customerSupport: "24/7 ድጋፍ",
        customerSupportDesc: "ቡድናችን ሁልጊዜ እዚህ አለ እርስዎን ለመርዳት",
        securePayment: "ደህንነቱ የተጠበቀ ክፍያ",
        securePaymentDesc: "ግብይቶችዎ ሁልጊዜ �በስተካከል ይጠበቃሉ",
        blogsInsights: "ብሎጎች እና ግንዛቤዎች",
        blogTitle1: "ትክክለኛውን ምርት እንዴት መምረጥ እንደሚቻል",
        blogExcerpt1: "ለእርስዎ የሚመች ምርት ለመምረጥ ጠቃሚ ምክሮች...",
        blogTitle2: "በ2023 ዓ.ም የኢ-ኮሜርስ አዝማሚያዎች",
        blogExcerpt2: "የመስመር ላይ ግዢን የሚቆጣጠሩ የቅርብ ጊዜ አዝማሚያዎችን ይፈልጉ...",
        blogTitle3: "ተጨማሪ ግዢ መመሪያ",
        blogExcerpt3: "ለአካባቢ ደህንነት የሚያስተዋውቁ ግዢዎችን እንዴት ማድረግ እንደሚቻል ይማሩ...",
        readMore: "ተጨማሪ ያንብቡ",
        aboutUs: "ስለ እኛ",
        aboutDesc: "ኢትዮጃርኬት በመላው ኢትዮጵያ ገዢዎችን እና ሻጮችን የሚያገናኝ የኢትዮጵያ መሪ የኢ-ኮሜርስ መድረክ ነው።",
        quickLinks: "ፈጣን አገናኞች",
        contactUs: "አግኙን",
        newsletter: "ዜና ዜና",
        emailPlaceholder: "የእርስዎ ኢሜይል",
        subscribe: "ይመዝገቡ",
        allRightsReserved: "ሁሉም መብቶች የተጠበቁ ናቸው",
        profile: "መገለጫ",
        sellerDashboard: "የሻጭ ዳሽቦርድ",
        logout: "ይውጡ",
        fullName: "ሙሉ ስም",
        password: "የይለፍ ቃል",
        confirmPassword: "የይለፍ ቃል ያረጋግጡ",
        registerAsSeller: "እንደ ሻጭ ይመዝገቡ",
        noAccount: "መለያ የሎትም?",
        haveAccount: "ቀድሞውኑ መለያ አለዎት?",
        userProfile: "የተጠቃሚ መገለጫ",
        uploadPhoto: "ፎቶ ይጫኑ",
        accountType: "የመለያ አይነት",
        joinedDate: "የተቀላቀለው",
        editProfile: "መገለጫ ያርትዑ",
        viewOrders: "ትዕዛዞችን ይመልከቱ",
        becomeSeller: "ሻጭ ይሁኑ",
        myProducts: "የእኔ ምርቶች",
        addProduct: "ምርት ያክሉ",
        orders: "ትዕዛዞች",
        analytics: "ትንታኔ",
        productName: "የምርት ስም",
        description: "መግለጫ",
        price: "ዋጋ (ብር)",
        category: "ምድብ",
        selectCategory: "ምድብ ይምረጡ",
        stock: "የክምችት ብዛት",
        productImages: "የምርት ፎቶዎች",
        offer: "ቅናሽ",
        addToCart: "ወደ ጋሪ ያክሉ"
    },
    om: {
        home: "Mana",
        featured: "Kan Addaan Duree",
        categories: "Gareewwan",
        offers: "Gatii Gadiifamaa",
        newArrivals: "Kan Haaraa Dhufan",
        services: "Tajaajilaa",
        blogs: "Blogii",
        login: "Seensa",
        signup: "Galmaa'aa",
        heroTitle: "Qopheessitoota Addaa Addaa Argadhaa",
        heroSubtitle: "Bitadhaa garaa bitattotaa kumaatamaa Itoophiyaa mara",
        shopNow: "Amma Bitadhaa",
        shopCategories: "Gareewwan Bitadhaa",
        electronics: "Eleektirooniksii",
        fashion: "Faashinii",
        homeGarden: "Manaa fi Biqiltuu",
        beauty: "Bareedina",
        sports: "Spoorii",
        books: "Kitaabota",
        toys: "Qophiiwwan",
        grocery: "Bitamuu",
        featuredProducts: "Qopheessitoota Addaa",
        holidayOffers: "Gatii Gadiifamaa Ayyaanaa",
        specialDiscount: "Gadiifama 50% Hangaa",
        limitedTime: "Gatii gadiifamaa yeroo xumuraa ayyaanaaf",
        newArrivals: "Qopheessitoota Haaraa",
        ourServices: "Tajaajila Keenya",
        fastDelivery: "Dhiyeessii Xiqqoo",
        fastDeliveryDesc: "Qopheessitoota keessan guyyaa 1-3 keessatti argadhaa",
        easyReturns: "Deebiin Laafaa",
        easyReturnsDesc: "Seera deebii guyyaa 30 qopheessitota baay'ee irratti",
        customerSupport: "Gargaarsa 24/7",
        customerSupportDesc: "Gareen keenya yeroo hunda asii jira si gargaaruf",
        securePayment: "Kaffalti Dhoksaa",
        securePaymentDesc: "Giddugalaa kaffaltii keessan yeroo hunda eegama",
        blogsInsights: "Blogiiwwan fi Hubannoo",
        blogTitle1: "Akkaataa Qopheessitoota Sirrii Filachuuf",
        blogExcerpt1: "Gorsa barbaachisaa qopheessitoota sirrii filachuuf...",
        blogTitle2: "Jijjiirama E-Commerce 2023",
        blogExcerpt2: "Jijjiirama ammaa bitaa toora interneetii jijjiiru argadhaa...",
        blogTitle3: "Qajeelcha Bitaa Duraanii",
        blogExcerpt3: "Akkaataa bitaa lafa eegumsaaf tolchu baradhaa...",
        readMore: "Dabalataan Dubbisaa",
        aboutUs: "Waa'ee Keenya",
        aboutDesc: "EthioMarket platformii e-commerce Itoophiyaa keessaa kan guddaa ta'ee bitattotaa fi bitaattotaa garaa garaa addunyaa walitti fiduudha.",
        quickLinks: "Linkiiwwan Xiqqoo",
        contactUs: "Nu Qunnamaa",
        newsletter: "Waraqaa Oduu",
        emailPlaceholder: "Email Keessan",
        subscribe: "Galmaa'aa",
        allRightsReserved: "Mirgi Hundaa Kan Eegama",
        profile: "Profile",
        sellerDashboard: "Daashboorida Bitattaa",
        logout: "Ba'i",
        fullName: "Maqaa Guutuu",
        password: "Jecha Darbii",
        confirmPassword: "Jecha Darbii Mirkaneessaa",
        registerAsSeller: "Akka bitattaa galmaa'aa",
        noAccount: "Akkaawuntii hin qabduu?",
        haveAccount: "Akkaawuntii qabduu?",
        userProfile: "Profile Fayyadamtaa",
        uploadPhoto: "Suuraa Baasaa",
        accountType: "Gosa Akkaawuntii",
        joinedDate: "Makuu",
        editProfile: "Profile Sirreessaa",
        viewOrders: "Ajaja Ilaalaa",
        becomeSeller: "Bitattaa Ta'aa",
        myProducts: "Qopheessitoota Koo",
        addProduct: "Qopheessitoo Dabalachaa",
        orders: "Ajajoota",
        analytics: "Fayyadama",
        productName: "Maqaa Qopheessitootaa",
        description: "Ibsa",
        price: "Gatii (Birr)",
        category: "Garee",
        selectCategory: "Garee Filadhaa",
        stock: "Lakkoofsa Qophaa'aa",
        productImages: "Suuraalee Qopheessitootaa",
        offer: "Gatii Gadiifamaa",
        addToCart: "Gaaricha Geessaa"
    }
};

// Set language
function setLanguage(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
    
    // Update direction for Amharic
    if (lang === 'am') {
        document.documentElement.dir = 'rtl';
    } else {
        document.documentElement.dir = 'ltr';
    }
    
    localStorage.setItem('language', lang);
}

// Language selector event listeners
enLangBtn.addEventListener('click', () => setLanguage('en'));
amLangBtn.addEventListener('click', () => setLanguage('am'));
omLangBtn.addEventListener('click', () => setLanguage('om'));

// Check for saved language preference
const savedLanguage = localStorage.getItem('language') || 'en';
setLanguage(savedLanguage);

// Initialize language buttons
document.querySelectorAll('.language-selector button').forEach(btn => {
    if (btn.id === `${savedLanguage}Lang`) {
        btn.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    }
});
