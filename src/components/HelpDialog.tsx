const ROWS: [string, string][] = [
  ['Tab', 'nový podradený uzol'],
  ['Enter', 'nový súrodenec (Ctrl+Enter: podradený)'],
  ['Space / F2 / dvojklik', 'upraviť text uzla'],
  ['písanie', 'začne upravovať a nahradí text'],
  ['Shift+Enter (pri úprave)', 'nový riadok v uzle'],
  ['Tab (pri úprave)', 'uložiť a vytvoriť podradený'],
  ['Esc', 'zrušiť úpravu / odznačiť'],
  ['Delete / Backspace', 'zmazať uzol aj s podstromom'],
  ['Šípky', 'pohyb po mape'],
  ['Ctrl + ↑ / ↓', 'presunúť medzi súrodencami'],
  ['Ctrl + . alebo Ctrl + /', 'zbaliť / rozbaliť'],
  ['Ctrl + Z / Ctrl + Shift + Z', 'späť / znova'],
  ['Ctrl + K', 'hľadať čokoľvek'],
  ['?', 'táto nápoveda'],
  ['ťahanie uzla na iný uzol', 'presunúť pod iný uzol'],
  ['koliesko / ťahanie plátna', 'posun, Ctrl + koliesko: zoom'],
]

export function HelpDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="overlay" onMouseDown={onClose}>
      <div className="help" onMouseDown={(e) => e.stopPropagation()}>
        <h3>Klávesové skratky</h3>
        <table>
          <tbody>
            {ROWS.map(([k, v]) => (
              <tr key={k}>
                <td>
                  <kbd>{k}</kbd>
                </td>
                <td>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>
          V poznámkach napíš <code>[[</code> a vyber uzol – vznikne väzba, ktorú uvidíš v inšpektore uzla. Dáta sa ukladajú lokálne v prehliadači (IndexedDB);
          zálohu stiahneš cez ikonu v ľavom dolnom rohu.
        </p>
      </div>
    </div>
  )
}
