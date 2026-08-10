import './style.css';
import { AnimeDetectiveApp } from './ui/AnimeDetectiveApp';

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('Missing #app');
new AnimeDetectiveApp(root).mount();
