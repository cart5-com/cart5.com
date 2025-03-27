import { ref, watch, onMounted } from "vue";
import { type CartItem } from "@lib/types/menuType";

const LOCAL_STORAGE_KEY = `v1-restaurant-cart-${window.restaurantId}`;

// Initialize with empty array, will be populated from localStorage in onMounted
export const cartStore = ref<CartItem[]>([]);

// Load cart from localStorage
const loadCart = () => {
    try {
        const savedCart = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedCart) {
            cartStore.value = JSON.parse(savedCart);
        }
    } catch (error) {
        console.error("Failed to load cart from localStorage:", error);
    }
};

// Save cart to localStorage
const saveCart = () => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cartStore.value));
    } catch (error) {
        console.error("Failed to save cart to localStorage:", error);
    }
};

// Initialize cart from localStorage
if (typeof window !== 'undefined') {
    loadCart();
}

// Watch for changes to cart and save to localStorage
if (typeof window !== 'undefined') {
    watch(cartStore, () => {
        saveCart();
    }, { deep: true });
}

export const addToCart = (item: CartItem) => {
    cartStore.value.push(item);
    saveCart();
}

export const removeFromCart = (index: number) => {
    cartStore.value.splice(index, 1);
    saveCart();
}

export const clearCart = () => {
    cartStore.value = [];
    saveCart();
}
