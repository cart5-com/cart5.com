import { type InjectionKey, inject, provide } from 'vue'

interface MenuOperations {
    openItemDialog: (itemId: string) => void
    openCategoryDialog: (categoryId: string) => void
    openOptionGroupDialog: (optionGroupId: string) => void
    addNewOptionGroup: () => string
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