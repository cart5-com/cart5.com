import { type InjectionKey, inject, provide } from 'vue'

interface MenuOperations {
    editItem: (itemId: string) => void
    previewItem: (itemId: string) => void
}

const MenuOperationsKey = Symbol() as InjectionKey<MenuOperations>

export function provideMenuOperations(operations: MenuOperations) {
    provide(MenuOperationsKey, operations)
}

export function useMenuOperations() {
    const operations = inject(MenuOperationsKey)
    if (!operations) {
        throw new Error('MenuOperations not provided')
    }
    return operations
} 