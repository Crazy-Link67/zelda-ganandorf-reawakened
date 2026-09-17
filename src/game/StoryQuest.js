// Story and Quest System
export class StoryQuestManager {
  constructor() {
    this.title = "The Legend of Zelda: Rise of the Legends - Ganondorf Reawakened";
    this.prologueText = [
      "Beneath Hyrule Castle, a cataclysmic gloom has broken the ancient seal.",
      "Demon King Ganondorf has reawakened in fury, shattering the Master Sword into fractured embers.",
      "Princess Zelda vanished into an enigmatic rift of sacred light, leaving behind only an ancient echo.",
      "You awaken high in the heavens upon the Great Sky Island. The power of the Zonai now pulses in your right arm.",
      "Leap from the Awakening Sanctuary, reclaim your strength, find Princess Zelda, and vanquish the Reawakened Malice!"
    ];

    this.quests = [
      {
        id: 'quest_sky_island',
        title: 'Step of Faith: The Great Sky Island',
        description: 'Walk onto the diving ledge, leap into the clouds, and deploy your Paraglider with Spacebar.',
        completed: false
      },
      {
        id: 'quest_ultrahand',
        title: 'Ancient Powers: Ultrahand & Fusion',
        description: 'Press [F] to use Ultrahand to lift Zonai artifacts, and [Q] to fuse elemental materials to your blade.',
        completed: false
      },
      {
        id: 'quest_find_zelda',
        title: 'Echoes of the Past: Find Princess Zelda',
        description: 'Investigate the Temple of Time floating island and locate the Zonai sacred shrine.',
        completed: false
      },
      {
        id: 'quest_defeat_ganondorf',
        title: 'Rise of the Legends: Ganondorf Reawakened',
        description: 'Glide to the distant Sky Arena (Z=170) and defeat Demon King Ganondorf in his two-phase battle!',
        completed: false
      }
    ];

    this.currentQuestIndex = 0;
  }

  getCurrentQuest() {
    return this.quests[this.currentQuestIndex];
  }

  completeCurrentQuest() {
    if (this.currentQuestIndex < this.quests.length) {
      this.quests[this.currentQuestIndex].completed = true;
      this.currentQuestIndex = Math.min(this.quests.length - 1, this.currentQuestIndex + 1);
      return true;
    }
    return false;
  }
}

export const story = new StoryQuestManager();

