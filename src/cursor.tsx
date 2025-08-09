import { useEffect } from 'react';
import './cursor.css';

//const INTERACTIVE_TAGS = ['A', 'BUTTON', 'LABEL', 'INPUT', 'TEXTAREA'];

export function Cursor() {
  useEffect(() => {
    const pulse = document.getElementById('cursor-pulse');

    const move = (e: MouseEvent) => {
      if (pulse) {
        pulse.style.left = `${e.clientX}px`;
        pulse.style.top = `${e.clientY}px`;
      }
    };

    document.addEventListener('mousemove', move);
    return () => document.removeEventListener('mousemove', move);
  }, []);

//   useEffect(() => {
//     const handleEnter = (e: Event) => {
//       const target = e.target as HTMLElement;
//       const isInteractive =
//         INTERACTIVE_TAGS.includes(target.tagName) ||
//         target.getAttribute('role') === 'button' ||
//         target.onclick !== null ||
//         target.classList.contains('r3f-clickable');

//       if (isInteractive) {
//         document.body.classList.add('hovering-interactive');
//       }
//     };

//     const handleLeave = (e: Event) => {
//       const target = e.target as HTMLElement;
//       const isInteractive =
//         INTERACTIVE_TAGS.includes(target.tagName) ||
//         target.getAttribute('role') === 'button' ||
//         target.onclick !== null ||
//         target.classList.contains('r3f-clickable');

//       if (isInteractive) {
//         document.body.classList.remove('hovering-interactive');
//       }
//     };

//     // Delegate enter/leave events on the whole document
//     document.addEventListener('mouseenter', handleEnter, true);
//     document.addEventListener('mouseleave', handleLeave, true);

//     return () => {
//       document.removeEventListener('mouseenter', handleEnter, true);
//       document.removeEventListener('mouseleave', handleLeave, true);
//     };
//   }, []);

  return <div id="cursor-pulse" />;
}
