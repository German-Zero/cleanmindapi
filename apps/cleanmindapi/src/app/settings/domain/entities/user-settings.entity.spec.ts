import { UserSettings } from './user-settings.entity';
import { Theme } from '../enums/theme.enum';
import { BackgroundMotion } from '../enums/background-motion.enum';

describe('UserSettings', () => {
  it('persists appearance preferences together', () => {
    const settings = UserSettings.createDefault('user-id');

    expect(settings.theme).toBe(Theme.LUNAR_MIND);
    expect(settings.backgroundMotion).toBe(BackgroundMotion.NONE);

    settings.changeAppearance(
      Theme.SOFT_DAWN,
      BackgroundMotion.SOFT_AURORA,
    );

    expect(settings.theme).toBe(Theme.SOFT_DAWN);
    expect(settings.backgroundMotion).toBe(
      BackgroundMotion.SOFT_AURORA,
    );
  });
});
