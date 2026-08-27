import type { MessageCatalog } from '../MessageCatalog';

const ru = {
  'match3.help.trigger': 'Помощь по Match-3',
  'match3.help.label': 'СПРАВКА',
  'match3.help.title': 'Как работает расследование',
  'match3.help.intro': 'Короткая памятка по правилам. Её можно открыть в любой момент: состояние доски и число ходов не меняются.',
  'match3.help.objectives.body': 'Завершите все цели до окончания ходов. Карточки сверху показывают нужные объекты и текущий прогресс.',
  'match3.help.hint.body': 'Подсказка отмечает лучший легальный ход с учётом текущих целей. Просмотр подсказки не тратит ход; после 30 секунд бездействия она может появиться автоматически.',
  'match3.help.specials.title': 'Спецфишки',
  'match3.help.specials.intro': 'Изображение показывает эффект бонуса; цвет и тип базовой фишки под ним сохраняются.',
  'match3.help.special.flash-row.body': 'Горизонтальная линия из 4 → очищает весь ряд.',
  'match3.help.special.flash-column.body': 'Вертикальная линия из 4 → очищает всю колонку.',
  'match3.help.special.evidence.body': 'Совпадение в форме T или L → очищает область 3×3.',
  'match3.help.special.lead.body': 'Квадрат 2×2 → очищает клетки рядом и одну полезную удалённую цель.',
  'match3.help.special.insight.body': 'Линия из 5+ → очищает все фишки сохранённого типа.',
  'match3.help.reshuffle.title': 'Нет доступных ходов',
  'match3.help.reshuffle.body': 'Если на поле не осталось легальных ходов, доска автоматически перемешается. Само перемешивание не расходует ход.',
  'match3.help.closeHint': 'Нажмите ? ещё раз, чтобы закрыть справку.',
} satisfies MessageCatalog;

const be = {
  'match3.help.trigger': 'Даведка па Match-3',
  'match3.help.label': 'ДАВЕДКА',
  'match3.help.title': 'Як працуе расследаванне',
  'match3.help.intro': 'Кароткая памятка па правілах. Яе можна адкрыць у любы момант: стан поля і колькасць хадоў не змяняюцца.',
  'match3.help.objectives.body': 'Завяршыце ўсе мэты да заканчэння хадоў. Карткі зверху паказваюць патрэбныя аб’екты і бягучы прагрэс.',
  'match3.help.hint.body': 'Падказка адзначае найлепшы дазволены ход з улікам бягучых мэт. Прагляд падказкі не траціць ход; пасля 30 секунд бяздзейнасці яна можа з’явіцца аўтаматычна.',
  'match3.help.specials.title': 'Спецфішкі',
  'match3.help.specials.intro': 'Выява паказвае эфект бонуса; колер і тып базавай фішкі пад ёй захоўваюцца.',
  'match3.help.special.flash-row.body': 'Гарызантальны рад з 4 → ачышчае ўвесь рад.',
  'match3.help.special.flash-column.body': 'Вертыкальны слупок з 4 → ачышчае ўвесь слупок.',
  'match3.help.special.evidence.body': 'Супадзенне ў форме T або L → ачышчае вобласць 3×3.',
  'match3.help.special.lead.body': 'Квадрат 2×2 → ачышчае клеткі побач і адну карысную аддаленую мэту.',
  'match3.help.special.insight.body': 'Лінія з 5+ → ачышчае ўсе фішкі захаванага тыпу.',
  'match3.help.reshuffle.title': 'Няма даступных хадоў',
  'match3.help.reshuffle.body': 'Калі на полі не засталося дазволеных хадоў, дошка аўтаматычна перамяшаецца. Само перамешванне не расходуе ход.',
  'match3.help.closeHint': 'Націсніце ? яшчэ раз, каб закрыць даведку.',
} satisfies MessageCatalog;

const en = {
  'match3.help.trigger': 'Match-3 help',
  'match3.help.label': 'HELP',
  'match3.help.title': 'How the investigation works',
  'match3.help.intro': 'A short rules reference you can open at any time. Opening it does not change the board or spend a move.',
  'match3.help.objectives.body': 'Complete every objective before you run out of moves. The cards at the top show the required objects and current progress.',
  'match3.help.hint.body': 'Hint marks the best legal move for the current objectives. Viewing it does not spend a move; after 30 seconds of inactivity it may appear automatically.',
  'match3.help.specials.title': 'Special tiles',
  'match3.help.specials.intro': 'The artwork shows each bonus effect; the base tile color and type remain visible underneath.',
  'match3.help.special.flash-row.body': 'Horizontal line of 4 → clears the entire row.',
  'match3.help.special.flash-column.body': 'Vertical line of 4 → clears the entire column.',
  'match3.help.special.evidence.body': 'T- or L-shaped match → clears a 3×3 area.',
  'match3.help.special.lead.body': '2×2 square → clears nearby cells and one useful remote target.',
  'match3.help.special.insight.body': 'Line of 5+ → clears every tile of the retained type.',
  'match3.help.reshuffle.title': 'No available moves',
  'match3.help.reshuffle.body': 'If the board has no legal moves, it reshuffles automatically. The reshuffle itself does not spend a move.',
  'match3.help.closeHint': 'Tap ? again to close Help.',
} satisfies MessageCatalog;

export const match3HelpCatalogs = { ru, be, en } as const;
