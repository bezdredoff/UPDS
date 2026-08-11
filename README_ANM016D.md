# ANM-016D · Unified Header Navigation & Contrast

Build: `0.16.8-anm016d`

Цель — убрать разнобой навигации и слабый контраст header-кнопок без добавления нового UI-слоя. Используется один shared `.app-header` contract.

Ключевые изменения:

- высокий контраст navy/cream/gold;
- единые Settings + Main Menu на VN/choice/Match-3/result/ending и сервисных экранах;
- contextual LOG / DOSSIER / Back;
- удалён нижний дублирующий VN CONFIG;
- gear в VN открывает прежний полный reading/audio config overlay;
- panel headers используют тот же контракт;
- Match-3 menu exit защищён confirm при активной попытке.

ANM-016B R6 и ANM-016C R2 сохранены.
