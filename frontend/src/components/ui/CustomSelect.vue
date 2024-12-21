<script setup lang="ts">
import { computed, nextTick, ref, type SelectHTMLAttributes, watch } from "vue";
import { useSelectDropdown } from "@/composables/useSelectDropdown";

interface SelectItem {
    value: string | number;
    label: string;
    disabled?: boolean;
}

interface SelectGroup {
    label: string;
    items: (SelectItem | SimpleItem)[];
}

interface ExtendedHTMLElement extends HTMLElement {
    _clickOutsideEvent?: (event: Event) => void;
}

type SimpleItem = string | number;

interface CustomSelectProps extends /* @vue-ignore */ SelectHTMLAttributes {
    modelValue: string | number | null | undefined | (string | number)[];
    items: (SelectItem | SelectGroup | SimpleItem)[];
    searchable?: boolean;
    clearable?: boolean;
    loading?: boolean;
    error?: string;
    size?: "small" | "medium" | "large";
    required?: boolean;
    disabled?: boolean;
}

type EmitEvents = {
    "update:modelValue": [value: CustomSelectProps["modelValue"]];
    change: [value: CustomSelectProps["modelValue"]];
    focus: [event: FocusEvent];
    blur: [event: FocusEvent];
    search: [value: string];
    clear: [];
    open: [];
    close: [];
};

const props = withDefaults(defineProps<CustomSelectProps>(), {
    searchable: false,
    clearable: false,
    loading: false,
    error: "",
    size: "medium",
    required: false,
    disabled: false,
});

const emit = defineEmits<EmitEvents>();

const isOpen = ref(false);
const searchQuery = ref("");
const isFocused = ref(false);
const searchInputRef = ref<HTMLInputElement | null>(null);

const computedClasses = computed(() => ({
    "custom-select": true,
    "custom-select--open": isOpen.value,
    "custom-select--disabled": props.disabled,
    "custom-select--error": !!props.error,
    "custom-select--focused": isFocused.value,
    [`custom-select--${props.size}`]: true,
}));

const normalizedItems = computed(() => {
    return props.items.map((item) => {
        if (typeof item === "string" || typeof item === "number") {
            return {
                value: item,
                label: String(item),
            };
        }
        if ("items" in item) {
            return {
                ...item,
                items: item.items.map((subItem) =>
                    typeof subItem === "string" || typeof subItem === "number"
                        ? { value: subItem, label: String(subItem) }
                        : subItem,
                ),
            };
        }
        return item;
    });
});

const filteredItems = computed(() => {
    if (!props.searchable || !searchQuery.value) {
        return normalizedItems.value;
    }

    const query = searchQuery.value.toLowerCase();
    return normalizedItems.value
        .map((item) => {
            if ("items" in item) {
                return {
                    ...item,
                    items: item.items.filter((subItem) => String(subItem.label).toLowerCase().includes(query)),
                };
            }
            return item;
        })
        .filter((item) => {
            if ("items" in item) {
                return item.items.length > 0;
            }
            return String(item.label).toLowerCase().includes(query);
        });
});

const flattenedItems = computed(() => normalizedItems.value.flatMap((item) => ("items" in item ? item.items : [item])));

const selectedLabel = computed(() => {
    const modelValue = props.modelValue;
    if (!modelValue) return "";

    if (Array.isArray(modelValue)) {
        return flattenedItems.value
            .filter((item) => modelValue.includes(item.value))
            .map((item) => item.label)
            .join(", ");
    }

    return flattenedItems.value.find((item) => item.value === modelValue)?.label || "";
});

const handleSelect = (item: SelectItem) => {
    if (props.disabled || item.disabled) return;

    const newValue = item.value;
    emit("update:modelValue", newValue);
    emit("change", newValue);

    if (!Array.isArray(props.modelValue)) {
        closeDropdown();
    }
};

const handleFocus = (event: FocusEvent) => {
    event.stopPropagation();
    if (props.disabled) return;
    isFocused.value = true;
    emit("focus", event);
};

const handleBlur = (event: FocusEvent) => {
    event.stopPropagation();
    isFocused.value = false;
    emit("blur", event);
};

const handleSearch = (event: Event) => {
    event.stopPropagation();
    const target = event.target as HTMLInputElement;
    searchQuery.value = target.value;
    emit("search", searchQuery.value);
};

const handleClear = () => {
    emit("update:modelValue", Array.isArray(props.modelValue) ? [] : null);
    emit("clear");
    searchQuery.value = "";
};

const { registerOpen, unregisterOpen, shouldClose } = useSelectDropdown();

const toggleDropdown = () => {
    if (props.disabled) return;

    if (!isOpen.value) {
        registerOpen();
    } else {
        unregisterOpen();
    }

    isOpen.value = !isOpen.value;
    if (isOpen.value) {
        emit("open");
        nextTick(() => {
            if (props.searchable && searchInputRef.value) {
                searchInputRef.value.focus();
            }
        });
    } else {
        emit("close");
    }
};

const closeDropdown = () => {
    isOpen.value = false;
    unregisterOpen();
    clearSearchOnClose();
    emit("close");
};

const isSelected = (value: string | number) => {
    const modelValue = props.modelValue;
    if (!modelValue) return false;

    if (Array.isArray(modelValue)) {
        return modelValue.includes(value);
    }
    return modelValue === value;
};

const vClickOutside = {
    mounted: (el: ExtendedHTMLElement, { value }: any) => {
        el._clickOutsideEvent = (event: Event) => {
            const target = event.target as HTMLElement;
            const isLabelClick = target.closest(".custom-select__label") && !target.closest(".custom-select__control");
            const isOutside = !el.contains(target);

            if (isOutside || isLabelClick) {
                value(event);
            }
        };
        document.addEventListener("click", el._clickOutsideEvent);
    },
    unmounted: (el: ExtendedHTMLElement) => {
        if (el._clickOutsideEvent) {
            document.removeEventListener("click", el._clickOutsideEvent);
        }
    },
};

const clearSearchOnClose = () => {
    searchQuery.value = "";
};

watch(shouldClose, (should) => {
    if (should && isOpen.value) {
        closeDropdown();
    }
});
</script>

<template>
    <div :class="computedClasses" v-click-outside="closeDropdown" :aria-disabled="props.disabled">
        <label v-if="$attrs.label" class="custom-select__label">
            {{ $attrs.label }}
            <span v-if="required" class="custom-select__required">*</span>
        </label>

        <div
            class="custom-select__control"
            @click.stop="!props.disabled && toggleDropdown"
            role="button"
            :tabindex="props.disabled ? -1 : 0"
        >
            <div class="custom-select__value" @click.stop="toggleDropdown">
                <template v-if="searchable && isOpen">
                    <input
                        ref="searchInputRef"
                        type="text"
                        class="custom-select__search"
                        v-model="searchQuery"
                        @input="handleSearch"
                        @focus="handleFocus"
                        @blur="handleBlur"
                        @click.stop
                        :placeholder="selectedLabel || ($attrs.placeholder as string | undefined)"
                    />
                </template>
                <template v-else>
                    <span
                        :class="modelValue ? 'custom-select__selected' : 'custom-select__placeholder'"
                        @click.stop="toggleDropdown"
                    >
                        {{ modelValue ? selectedLabel : ($attrs.placeholder as string | undefined) }}
                    </span>
                </template>
            </div>

            <div class="custom-select__indicators">
                <button
                    v-if="clearable && modelValue"
                    type="button"
                    class="custom-select__clear"
                    @click.stop="handleClear"
                >
                    ×
                </button>
                <span class="custom-select__arrow" :class="{ 'is-open': isOpen }"> ▼ </span>
            </div>
        </div>

        <transition name="dropdown">
            <div v-show="isOpen" class="custom-select__dropdown">
                <div v-if="loading" class="custom-select__loading">Loading...</div>
                <template v-else>
                    <transition-group name="option" tag="div">
                        <div
                            v-for="(item, index) in filteredItems"
                            :key="index"
                            class="custom-select__option-container"
                        >
                            <template v-if="'items' in item">
                                <div class="custom-select__group-label">{{ item.label }}</div>
                                <div
                                    v-for="option in item.items"
                                    :key="option.value"
                                    class="custom-select__option"
                                    :class="{
                                        'is-selected': isSelected(option.value),
                                        'is-disabled': option.disabled,
                                    }"
                                    @click="handleSelect(option)"
                                >
                                    {{ option.label }}
                                </div>
                            </template>
                            <template v-else>
                                <div
                                    class="custom-select__option"
                                    :class="{
                                        'is-selected': isSelected(item.value),
                                        'is-disabled': item.disabled,
                                    }"
                                    @click="handleSelect(item)"
                                >
                                    {{ item.label }}
                                </div>
                            </template>
                        </div>
                    </transition-group>
                </template>
            </div>
        </transition>

        <div v-if="error" class="custom-select__error">
            {{ error }}
        </div>
    </div>
</template>

<style lang="scss" scoped>
.custom-select {
    position: relative;
    width: 100%;
    font-family: var(--font-sans);

    &__label {
        display: block;
        margin-bottom: calc(var(--spacing-element) * 0.5);
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--color-text);
    }

    &__required {
        color: #dc2626;
        margin-left: calc(var(--spacing-element) * 0.25);
    }

    &__control {
        position: relative;
        display: flex;
        align-items: center;
        padding: calc(var(--spacing-element) * 0.5) var(--spacing-element);
        background-color: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 0.375rem;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: var(--shadow-sm);
        user-select: none;
        outline: none;

        &:hover {
            border-color: var(--color-text-light);
            background-color: var(--color-hover);
        }

        &:focus {
            border-color: var(--color-primary);
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
        }
    }

    &__value {
        flex: 1;
        min-width: 0;
    }

    &__search {
        width: 100%;
        border: none;
        outline: none;
        background: transparent;
        padding: 0;
        margin: 0;
        font-size: inherit;
        color: var(--color-text);

        &::placeholder {
            color: var(--color-text-light);
        }
    }

    &__selected {
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: var(--color-text);
    }

    &__placeholder {
        color: var(--color-text-light);
    }

    &__indicators {
        display: flex;
        align-items: center;
        margin-left: calc(var(--spacing-element) * 0.5);
    }

    &__clear {
        padding: 0;
        margin: 0;
        border: none;
        background: transparent;
        color: var(--color-text-light);
        font-size: 1.25rem;
        line-height: 1;
        cursor: pointer;
        margin-right: calc(var(--spacing-element) * 0.5);

        &:hover {
            color: var(--color-text);
        }
    }

    &__arrow {
        font-size: 0.75rem;
        color: var(--color-text-light);
        transition: transform 0.2s ease;

        &.is-open {
            transform: rotate(180deg);
        }
    }

    &__dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        margin-top: calc(var(--spacing-element) * 0.5);
        background-color: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 0.375rem;
        box-shadow: var(--shadow-md);
        z-index: 10;
        max-height: 15rem;
        overflow-y: auto;
        overflow-x: hidden;
    }

    &__loading {
        padding: var(--spacing-element);
        text-align: center;
        color: var(--color-text-light);
    }

    &__group-label {
        padding: calc(var(--spacing-element) * 0.5) var(--spacing-element);
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--color-text);
        background-color: var(--color-background);
    }

    &__option {
        padding: calc(var(--spacing-element) * 0.5) var(--spacing-element);
        cursor: pointer;
        color: var(--color-text);
        transition: all 0.15s ease;

        &:hover:not(.is-disabled) {
            background-color: var(--color-hover);
            padding-left: calc(var(--spacing-element) * 1.5);
        }

        &.is-selected {
            background-color: var(--color-primary);
            color: var(--color-surface);

            &:hover {
                background-color: var(--color-primary-hover);
            }
        }

        &.is-disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        &:not(.is-selected):hover {
            color: var(--color-primary);
            background-color: rgba(37, 99, 235, 0.1);
        }
    }

    &__error {
        margin-top: calc(var(--spacing-element) * 0.5);
        font-size: 0.875rem;
        color: #dc2626;
    }

    &--small {
        .custom-select__control {
            padding: calc(var(--spacing-element) * 0.25) calc(var(--spacing-element) * 0.75);
            font-size: 0.875rem;
        }
    }

    &--large {
        .custom-select__control {
            padding: calc(var(--spacing-element) * 0.75) calc(var(--spacing-element) * 1.25);
            font-size: 1.125rem;
        }
    }

    &--disabled {
        opacity: 0.5;
        cursor: not-allowed;

        .custom-select__control {
            pointer-events: none;
            background-color: var(--color-background);
            border-color: var(--color-border);
        }

        .custom-select__value,
        .custom-select__indicators {
            opacity: 0.7;
        }
    }

    &--error {
        .custom-select__control {
            border-color: #dc2626;

            &:hover {
                border-color: #b91c1c;
            }
        }
    }

    &--focused {
        .custom-select__control {
            border-color: var(--color-primary);
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
        }
    }

    .dropdown-enter-active,
    .dropdown-leave-active {
        transition: all 0.2s ease;
    }

    .dropdown-enter-from,
    .dropdown-leave-to {
        opacity: 0;
        transform: translateY(-10px);
    }

    .option-enter-active,
    .option-leave-active {
        transition: all 0.15s ease;
    }

    .option-enter-from,
    .option-leave-to {
        opacity: 0;
        transform: translateX(-10px);
    }

    &__control {
        transition: all 0.2s ease;
    }

    &__arrow {
        transition: transform 0.2s ease;
    }

    &__option {
        transition: all 0.15s ease;
    }

    &__clear {
        transition: all 0.15s ease;
    }

    &__selected,
    &__placeholder {
        transition: color 0.15s ease;
    }

    &__option {
        &:hover:not(.is-disabled) {
            transition: all 0.15s ease;
        }
    }

    &--focused {
        .custom-select__control {
            transition: all 0.2s ease;
        }
    }
}
</style>
