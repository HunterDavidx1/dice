export interface DiceRollerProps {
  // Add any props if needed in the future
}

export interface DiceRollerEmits {
  // Add any emits if needed in the future
}

export interface DiceRollerState {
  activeTab: 'custom' | 'player';
  qty: number;
  faces: number;
  diceColors: string[];
  modifier: number;
  minSuccess: number;
  customResults: number[];
  customResultText: string;
  playerModifier: number;
  playerMinSuccess: number;
  playerResults: (number | null)[];
  playerResultText: string;
}
