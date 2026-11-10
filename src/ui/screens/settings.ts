import { h, replace, topbar } from '../dom';
import { app, commit, applySettingsToPage } from '../../state/store';
import { DAILY_GOALS, defaultSave, exportCode, importCode, type Settings } from '../../state/save';
import { reminderSupported, scheduleReminder } from '../reminder';
import { speak } from '../speech';
import { SITE_URL } from '../shareCard';
import type { Screen } from '../../state/router';

const REMINDER_TIMES = ['07:30', '12:30', '20:00', '21:30'];

export function settingsScreen(): Screen {
  const body = h('div', { class: 'settings' });
  const el = h('main', { class: 'screen' }, topbar('설정', '#home'), body);

  const set = (patch: Partial<Settings>) => {
    commit({ ...app.save, settings: { ...app.save.settings, ...patch } });
    applySettingsToPage();
    paint();
  };

  const toggle = (label: string, desc: string, on: boolean, flip: () => void, id: string) =>
    h('button', { class: `row toggle${on ? ' on' : ''}`, role: 'switch', 'aria-checked': String(on), 'data-testid': id, onclick: flip },
      h('span', { class: 'row-text' }, h('b', null, label), h('small', null, desc)),
      h('span', { class: 'switch' }, h('i')));

  const segmented = (label: string, options: { value: string; text: string }[], current: string, pick: (v: string) => void, id: string) =>
    h('div', { class: 'row' },
      h('span', { class: 'row-text' }, h('b', null, label)),
      h('div', { class: 'seg', 'data-testid': id }, ...options.map((o) =>
        h('button', { class: o.value === current ? 'on' : '', 'aria-pressed': String(o.value === current), onclick: () => pick(o.value) }, o.text))));

  const backupOut = h('textarea', { class: 'code', readonly: true, rows: 3, 'aria-label': '백업 코드', 'data-testid': 'backup-code' });
  const backupIn = h('textarea', { class: 'code', rows: 3, placeholder: 'GJ1: 로 시작하는 코드를 붙여 넣는다', 'aria-label': '가져올 백업 코드', 'data-testid': 'restore-input' });
  const msg = h('p', { class: 'settings-msg', role: 'status', 'data-testid': 'settings-msg' });
  let confirmReset = false;

  function paint() {
    const st = app.save.settings;
    replace(body,
      h('section', { class: 'group' },
        h('h2', null, '보기와 소리'),
        toggle('큰 글씨', '이야기·문제·보기를 크게 보여 준다', st.large, () => set({ large: !st.large }), 'set-large'),
        toggle('읽어 주기', '한자 팝업과 원문의 소리 듣기', st.sound, () => { set({ sound: !st.sound }); if (!st.sound) speak('소리를 켰습니다'); }, 'set-sound'),
      ),
      h('section', { class: 'group' },
        h('h2', null, '학습'),
        segmented('하루 목표', DAILY_GOALS.map((g) => ({ value: String(g), text: `${g}문제` })), String(st.dailyGoal), (v) => set({ dailyGoal: Number(v) }), 'set-goal'),
        reminderSupported()
          ? segmented('매일 알림', [{ value: '', text: '끔' }, ...REMINDER_TIMES.map((t) => ({ value: t, text: t }))], st.reminder ?? '', async (v) => {
            const ok = await scheduleReminder(v || null);
            if (ok) set({ reminder: v || null });
            else msg.textContent = '알림 권한이 없어 설정하지 못했다. 기기 설정에서 알림을 허용해 주자.';
          }, 'set-reminder')
          : h('p', { class: 'row-note' }, '매일 알림은 iOS·Android 앱에서 쓸 수 있다.'),
      ),
      h('section', { class: 'group' },
        h('h2', null, '기록 옮기기'),
        h('p', { class: 'row-note' }, '기기를 바꿀 때 백업 코드를 복사해 새 기기에서 붙여 넣으면 진행이 그대로 옮겨진다.'),
        h('button', { class: 'btn', 'data-testid': 'backup-make', onclick: async () => {
          backupOut.value = exportCode(app.save);
          backupOut.hidden = false;
          try { await navigator.clipboard.writeText(backupOut.value); msg.textContent = '백업 코드를 만들고 클립보드에 복사했다.'; } catch { backupOut.select(); msg.textContent = '백업 코드를 만들었다. 길게 눌러 복사하자.'; }
        } }, '백업 코드 만들기'),
        backupOut,
        backupIn,
        h('button', { class: 'btn', 'data-testid': 'restore-apply', onclick: () => {
          const data = importCode(backupIn.value);
          if (!data) { msg.textContent = '코드를 읽지 못했다. GJ1: 로 시작하는 전체 코드를 붙여 넣었는지 확인하자.'; return; }
          commit(data);
          applySettingsToPage();
          backupIn.value = '';
          msg.textContent = `기록을 불러왔다. 복원한 고사 ${Object.values(data.stars).filter((x) => x > 0).length}편.`;
        } }, '이 코드로 불러오기'),
      ),
      h('section', { class: 'group danger' },
        h('h2', null, '처음부터 하기'),
        h('button', { class: `btn${confirmReset ? ' primary' : ''}`, 'data-testid': 'reset', onclick: () => {
          if (!confirmReset) { confirmReset = true; paint(); msg.textContent = '한 번 더 누르면 모든 진행이 지워진다. 되돌릴 수 없다.'; return; }
          const keep = app.save.settings;
          commit({ ...defaultSave(), settings: keep });
          confirmReset = false;
          paint();
          msg.textContent = '진행을 지웠다. 설정은 그대로 두었다.';
        } }, confirmReset ? '정말 지우기' : '진행 기록 모두 지우기'),
      ),
      msg,
      h('section', { class: 'group about' },
        h('h2', null, '정보'),
        h('p', null, '고전열전 1.0 · 원문은 『사기』·『논어』 백문, 풀이·그림은 자체 제작'),
        h('p', null, h('a', { href: `${SITE_URL}support.html`, target: '_blank', rel: 'noopener' }, '안내·문의'), ' · ', h('a', { href: `${SITE_URL}privacy.html`, target: '_blank', rel: 'noopener' }, '개인정보처리방침')),
      ),
    );
    backupOut.hidden = !backupOut.value;
  }
  paint();
  return { el };
}
