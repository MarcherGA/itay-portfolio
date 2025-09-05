import { useFocusStore } from "../../hooks/useFocusStore";
import { NavigationItem } from "../../types/navigationItem";

interface NavigationBarProps {
  items: NavigationItem[];
  className?: string;
  itemClassName?: string;
  activeItemClassName?: string;
}

export function NavigationBar({ 
  items, 
  className = '',
  itemClassName = '',
  activeItemClassName = ''
}: NavigationBarProps) {
  const { currentIndex } = useFocusStore();

  const handleNavigation = (item: NavigationItem) => {
    // Execute custom onClick if provided
    if (item.onClick) {
      item.onClick();
    }

    // Trigger navigation - the NavigationController will handle both transition and focus store update
    // We'll use a custom event to communicate with NavigationController
    window.dispatchEvent(new CustomEvent('navigate-to-target', { 
      detail: { targetId: item.targetId } 
    }));
  };

  const defaultClassName = `
    fixed top-6 left-1/2 transform -translate-x-1/2 z-50
    flex flex-row justify-center items-center gap-2 sm:gap-4 md:gap-6
    px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4
    bg-black/20 backdrop-blur-md
    border border-white/10 rounded-full
    shadow-lg shadow-black/25
    max-w-[90%] sm:max-w-[80%] md:max-w-none
  `.trim();

  const defaultItemClassName = `
    px-2 sm:px-4 md:px-6 py-1 sm:py-2 text-xs sm:text-sm md:text-base text-white/80 font-medium
    transition-all duration-300
    hover:text-white hover:bg-white/10
    rounded-full border border-transparent
    hover:border-white/20 hover:shadow-md
    cursor-interactive
    whitespace-nowrap
  `.trim();

  const defaultActiveItemClassName = `
    text-white bg-white/20 border-white/30
    shadow-md shadow-white/10
  `.trim();

  return (
    <nav className={className || defaultClassName}>
      {items.map((item, index) => {
        const isActive = currentIndex === item.targetId;
        const combinedItemClassName = `
          ${itemClassName || defaultItemClassName}
          ${isActive ? (activeItemClassName || defaultActiveItemClassName) : ''}
        `.trim();

        return (
          <button
            key={`${item.label}-${index}`}
            className={combinedItemClassName}
            onClick={() => handleNavigation(item)}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
