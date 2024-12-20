<script setup lang="ts">
interface ErrorBoxProps {
    message: string;
    title?: string;
    variant?: "error" | "warning" | "info";
    dismissible?: boolean;
    icon?: boolean;
    action?: {
        label: string;
        onClick: () => void;
    };
}

withDefaults(defineProps<ErrorBoxProps>(), {
    title: "",
    variant: "error",
    dismissible: false,
    icon: true,
});

const emit = defineEmits<{
    dismiss: [];
}>();

const variantConfig = {
    error: {
        bgColor: "var(--color-error-bg)",
        borderColor: "var(--color-error-border)",
        textColor: "var(--color-error-text)",
        icon: "⚠️",
    },
    warning: {
        bgColor: "var(--color-warning-bg)",
        borderColor: "var(--color-warning-border)",
        textColor: "var(--color-warning-text)",
        icon: "⚡",
    },
    info: {
        bgColor: "var(--color-info-bg)",
        borderColor: "var(--color-info-border)",
        textColor: "var(--color-info-text)",
        icon: "ℹ️",
    },
};
</script>

<template>
    <transition name="error-box">
        <div
            class="error-box"
            :class="`error-box--${variant}`"
            role="alert"
            :style="{
                backgroundColor: variantConfig[variant].bgColor,
                borderColor: variantConfig[variant].borderColor,
                color: variantConfig[variant].textColor,
            }"
        >
            <div class="error-box__content">
                <span v-if="icon" class="error-box__icon" aria-hidden="true">
                    {{ variantConfig[variant].icon }}
                </span>
                <div class="error-box__text">
                    <strong v-if="title" class="error-box__title">{{ title }}</strong>
                    <p class="error-box__message">{{ message }}</p>
                </div>
            </div>

            <div class="error-box__actions" v-if="dismissible || action">
                <button v-if="action" class="error-box__action-btn" @click="action.onClick">
                    {{ action.label }}
                </button>
                <button v-if="dismissible" class="error-box__dismiss" @click="emit('dismiss')" aria-label="Dismiss">
                    ×
                </button>
            </div>
        </div>
    </transition>
</template>

<style lang="scss" scoped>
.error-box {
    position: relative;
    padding: 1rem;
    margin: 1rem 0;
    border-radius: 0.5rem;
    border-width: 1px;
    border-style: solid;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    box-shadow: var(--shadow-sm);

    &__content {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        flex: 1;
    }

    &__icon {
        flex-shrink: 0;
        font-size: 1.25rem;
        line-height: 1;
    }

    &__text {
        flex: 1;
        min-width: 0;
    }

    &__title {
        display: block;
        font-weight: 600;
        margin-bottom: 0.25rem;
    }

    &__message {
        margin: 0;
        line-height: 1.5;
    }

    &__actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-left: auto;
    }

    &__action-btn {
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        border: 1px solid currentColor;
        background: transparent;
        color: inherit;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
            background-color: rgba(0, 0, 0, 0.1);
        }
    }

    &__dismiss {
        padding: 0.25rem;
        background: transparent;
        border: none;
        color: inherit;
        font-size: 1.5rem;
        line-height: 1;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.2s ease;

        &:hover {
            opacity: 1;
        }
    }
}

// Transition animations
.error-box-enter-active,
.error-box-leave-active {
    transition: all 0.3s ease;
}

.error-box-enter-from,
.error-box-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
</style>
