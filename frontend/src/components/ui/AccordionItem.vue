<script setup lang="ts">
import { inject } from "vue";

interface AccordionItemProps {
    title: string;
    name: string;
    icon?: string;
    disabled?: boolean;
}

defineProps<AccordionItemProps>();

const { isOpen, toggle } = inject("accordion") as {
    isOpen: (name: string) => boolean;
    toggle: (name: string) => void;
};

const handleEnter = (el: Element) => {
    if (el instanceof HTMLElement) {
        el.style.height = el.scrollHeight + "px";
    }
};

const handleLeave = (el: Element) => {
    if (el instanceof HTMLElement) {
        el.style.height = "0";
    }
};
</script>

<template>
    <div class="accordion-item" :class="{ 'is-open': isOpen(name) }">
        <button class="accordion-item__header" @click="toggle(name)" :disabled="disabled" type="button">
            <span class="accordion-item__title">{{ title }}</span>
            <span v-if="icon" class="accordion-item__icon">{{ icon }}</span>
            <span v-else class="accordion-item__arrow" :class="{ 'is-open': isOpen(name) }">▼</span>
        </button>

        <transition name="accordion" @enter="handleEnter" @leave="handleLeave">
            <div v-show="isOpen(name)" class="accordion-item__content">
                <div class="accordion-item__body">
                    <slot></slot>
                </div>
            </div>
        </transition>
    </div>
</template>

<style lang="scss" scoped>
.accordion-item {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    margin-bottom: 0.5rem;
    font-family: var(--font-sans);
    border-radius: 8px;
    overflow: hidden;

    &:last-child {
        margin-bottom: 0;
    }

    &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 1rem;
        background: none;
        border: none;
        text-align: left;
        cursor: pointer;
        color: var(--color-text);
        font-weight: 500;
        transition: all 0.2s ease;
        font-family: inherit;

        &:hover:not(:disabled) {
            background: var(--color-hover);
        }

        &:focus {
            outline: none;
            box-shadow: inset 0 0 0 2px var(--color-primary-light);
        }

        &-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--color-text);
            margin: 0;
            padding: 1rem 1.5rem;
            flex: 1;
            font-family: inherit;
        }
    }

    &__arrow {
        font-size: 0.75rem;
        transition: transform 0.2s ease;

        &.is-open {
            transform: rotate(180deg);
        }
    }

    &__content {
        height: 0;
        overflow: hidden;
        transition: height 0.3s ease;
    }

    &__body {
        padding: 1rem;
        background: var(--color-background);
        border-top: 1px solid var(--color-border);
    }
}

.accordion-enter-active,
.accordion-leave-active {
    transition: height 0.3s ease;
    overflow: hidden;
}

.accordion-enter-from,
.accordion-leave-to {
    height: 0 !important;
}
</style>
