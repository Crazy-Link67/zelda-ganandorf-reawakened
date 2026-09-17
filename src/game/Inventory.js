// Inventory and Item Management System
export class InventoryManager {
  constructor() {
    this.weapons = [
      { id: 'decayed_master_sword', name: "Decayed Master Sword", type: 'weapon', attack: 30, fused: null, description: "The legendary blade, scarred and drained of its power from the depths beneath Hyrule." },
      { id: 'knights_broadsword', name: "Knight's Broadsword", type: 'weapon', attack: 24, fused: null, description: "Standard issue blade favored by Hyrulean knights." },
      { id: 'zonai_longsword', name: "Zonai Longsword", type: 'weapon', attack: 34, fused: null, description: "An ancient blade forged with Zonai metallurgy that resonates with charges." },
      { id: 'gloom_katana', name: "Gloom Katana", type: 'weapon', attack: 50, fused: null, description: "A cursed blade pulsating with Ganondorf's malevolent reawakened malice." }
    ];

    this.bows = [
      { id: 'soldiers_bow', name: "Soldier's Bow", type: 'bow', attack: 14, description: "A sturdy wooden bow crafted for archers." },
      { id: 'zonai_bow', name: "Zonai Energy Bow", type: 'bow', attack: 30, description: "Channels ancient energy into precise high-velocity beams." },
      { id: 'royal_bow', name: "Royal Bow", type: 'bow', attack: 38, description: "An ornate bow granted only to the elite guards of Hyrule Castle." }
    ];

    this.shields = [
      { id: 'hylian_shield', name: "Hylian Shield", type: 'shield', defense: 90, description: "A legendary shield passed down through the royal family of Hyrule." },
      { id: 'zonai_shield', name: "Zonai Shield", type: 'shield', defense: 50, description: "Constructed of lightweight archaic alloys that deflect blasts." },
      { id: 'knights_shield', name: "Knight's Shield", type: 'shield', defense: 40, description: "A steel shield reliable in heated melee skirmishes." }
    ];

    this.staffs = [
      { id: 'fire_staff', name: "Ruby Fire Staff", type: 'staff', attack: 28, element: 'fire', description: "Unleashes bouncing fireballs that ignite the landscape." },
      { id: 'ice_staff', name: "Sapphire Frost Staff", type: 'staff', attack: 26, element: 'ice', description: "Emits freezing blizzards that encase monsters in solid ice." },
      { id: 'thunder_staff', name: "Topaz Thunder Staff", type: 'staff', attack: 32, element: 'shock', description: "Hurls arcs of electricity that disarm combatants." },
      { id: 'reawakened_staff', name: "Reawakened Malice Staff", type: 'staff', attack: 55, element: 'gloom', description: "Harnesses the reawakened dark sorcery of Demon King Ganondorf." }
    ];

    this.materials = [
      { id: 'fire_fruit', name: "Fire Fruit", count: 8, fuseBonus: 12, element: 'fire', description: "Bursting with heat. Explodes into flames upon impact." },
      { id: 'ice_fruit', name: "Ice Fruit", count: 6, fuseBonus: 12, element: 'ice', description: "Packed with freezing cold crystals." },
      { id: 'bomb_flower', name: "Bomb Flower", count: 10, fuseBonus: 35, element: 'explosive', description: "A volatile plant that detonates with tremendous force." },
      { id: 'zonai_charge', name: "Zonai Energy Charge", count: 12, fuseBonus: 20, element: 'energy', description: "Concentrated ancient power from sky constructs." },
      { id: 'zonai_horn', name: "Construct Horn Blade", count: 4, fuseBonus: 26, element: 'blade', description: "A razor-sharp mechanical appendage from a Soldier Construct." },
      { id: 'gloom_residue', name: "Gloom Residue", count: 5, fuseBonus: 40, element: 'gloom', description: "A petrifying sample of Ganondorf's reawakened miasma." }
    ];

    this.equippedWeapon = this.weapons[0];
    this.equippedBow = this.bows[0];
    this.equippedShield = this.shields[0];
    this.equippedStaff = this.staffs[0];
    this.selectedMaterial = this.materials[0];
    this.arrows = 30;
  }

  equipWeapon(index) {
    if (this.weapons[index]) {
      this.equippedWeapon = this.weapons[index];
    }
  }

  equipBow(index) {
    if (this.bows[index]) {
      this.equippedBow = this.bows[index];
    }
  }

  equipShield(index) {
    if (this.shields[index]) {
      this.equippedShield = this.shields[index];
    }
  }

  equipStaff(index) {
    if (this.staffs[index]) {
      this.equippedStaff = this.staffs[index];
    }
  }

  fuseMaterialToWeapon(weaponIndex, materialIndex) {
    const weapon = this.weapons[weaponIndex] || this.equippedWeapon;
    const material = this.materials[materialIndex] || this.selectedMaterial;

    if (!weapon || !material || material.count <= 0) return null;

    material.count--;
    weapon.fused = {
      name: material.name,
      bonus: material.fuseBonus,
      element: material.element
    };

    return weapon;
  }

  unfuseWeapon(weaponIndex) {
    const weapon = this.weapons[weaponIndex] || this.equippedWeapon;
    if (weapon && weapon.fused) {
      weapon.fused = null;
    }
  }

  getCurrentAttackPower() {
    let power = this.equippedWeapon ? this.equippedWeapon.attack : 5;
    if (this.equippedWeapon && this.equippedWeapon.fused) {
      power += this.equippedWeapon.fused.bonus;
    }
    return power;
  }
}

export const inventory = new InventoryManager();

