<script setup lang="ts">
import { computed, provide } from "vue";

interface AccordionProps {
    modelValue?: string | string[];
    multiple?: boolean;
    gap?: string;
    variant?: "default" | "outlined" | "minimal";
}

const props = withDefaults(defineProps<AccordionProps>(), {
    multiple: false,
    gap: "0.5rem",
    variant: "default",
});

const emit = defineEmits<{
    "update:modelValue": [value: string | string[]];
}>();

const openSections = computed({
    get: () => props.modelValue || (props.multiple ? [] : ""),
    set: (value) => emit("update:modelValue", value),
});

const isOpen = (name: string) => {
    if (props.multiple) {
        return (openSections.value as string[]).includes(name);
    }
    return openSections.value === name;
};

const toggle = (name: string) => {
    if (props.multiple) {
        const current = openSections.value as string[];
        const index = current.indexOf(name);
        if (index === -1) {
            openSections.value = [...current, name];
        } else {
            openSections.value = current.filter((item) => item !== name);
        }
    } else {
        openSections.value = openSections.value === name ? "" : name;
    }
};

const accordionContext = {
    isOpen,
    toggle,
};
provide("accordion", accordionContext);
</script>

<template>
    <div class="accordion" :class="`accordion--${variant}`" :style="{ gap }">
        <slot></slot>
    </div>
</template>

<style lang="scss" scoped>
.accordion {
    display: flex;
    flex-direction: column;
    width: 100%;
    background: var(--color-surface);
    border-radius: 0.375rem;
    overflow: hidden;

    &--outlined {
        border: 1px solid var(--color-border);
    }
}
</style>
