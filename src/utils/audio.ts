// Sound effects disabled per user request

class SoundManager {
  public enabled: boolean = false;

  public playClick(): void {}
  public playRunePlace(): void {}
  public playJutsuSubmit(): void {}
  public playVictory(): void {}
  public playFail(): void {}
}

export const sounds = new SoundManager();
