<script setup lang="ts">
interface SpinnerProps {
    size?: "small" | "medium" | "large";
    color?: string;
    thickness?: number;
    speed?: "slow" | "normal" | "fast";
    label?: string;
    overlay?: boolean;
}

const props = withDefaults(defineProps<SpinnerProps>(), {
    size: "medium",
    color: "currentColor",
    thickness: 2,
    speed: "normal",
    overlay: false,
});

const sizeMap = {
    small: "1.5rem",
    medium: "2.5rem",
    large: "3.5rem",
};

const speedMap = {
    slow: "1.5s",
    normal: "1s",
    fast: "0.6s",
};
</script>

<template>
    <div :class="['spinner-wrapper', { 'spinner-overlay': overlay }]" role="status" aria-label="{props.label}">
        <div
            class="spinner"
            :style="{
                width: sizeMap[props.size],
                height: sizeMap[props.size],
                borderWidth: `${props.thickness}px`,
                borderTopColor: props.color,
                animationDuration: speedMap[props.speed],
            }"
        />
        <span v-if="label" class="spinner-label">{{ label }}</span>
    </div>
</template>

<style lang="scss" scoped>
.spinner-wrapper {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &.spinner-overlay {
        position: absolute;
        inset: 0;
        background-color: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(2px);
        z-index: 50;
    }
}

.spinner {
    border-style: solid;
    border-color: var(--color-border);
    border-radius: 50%;
    animation: spin linear infinite;

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
}

.spinner-label {
    color: var(--color-text);
    font-size: 0.875rem;
    text-align: center;
}
</style>
