import { createApp } from 'vue';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/index.css';
import App from './App.vue';

// 1. 禁止右鍵選單 (Disable Right-Click Context Menu)
document.addEventListener('contextmenu', (e: MouseEvent) => {
  e.preventDefault();
  return false;
});

// 2. 禁止左鍵反白與選取文字 (Disable Text Selection Highlighting on UI elements)
document.addEventListener('selectstart', (e: Event) => {
  const target = e.target as HTMLElement;
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
    return true;
  }
  e.preventDefault();
  return false;
});

// 3. 禁止拖曳元素 (Disable Drag & Drop)
document.addEventListener('dragstart', (e: DragEvent) => {
  e.preventDefault();
  return false;
});

const app = createApp(App);
app.mount('#app');
