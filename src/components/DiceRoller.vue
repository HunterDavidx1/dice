<template>
  <div class="dice-roller">
    <h1>Dice Roller DaggerHeart </h1>
    <div class="tabs">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'custom' }" 
        @click="activeTab = 'custom'"
      >
        <span>1</span> Full Custom
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'player' }" 
        @click="activeTab = 'player'"
      >
        <span>2</span> Player
      </button>
    </div>

    <!-- Custom Dice Tab -->
    <div v-if="activeTab === 'custom'" class="tab-content">
      <form @submit.prevent="rollCustom">
        <div>
          <label for="qty">Dices</label>
          <input 
            type="number" 
            id="qty" 
            v-model.number="qty" 
            min="1" 
            max="10" 
            required
          >
        </div>
        <div>
          <label for="faces">Faces (max 20):</label>
          <input 
            type="number" 
            id="faces" 
            v-model.number="faces" 
            min="2" 
            max="20" 
            required
          >
        </div>
        <div v-for="(color, i) in diceColors" :key="i">
          <label :for="'color' + i">Color for Die {{ i + 1 }}:</label>
          <input 
            type="color" 
            :id="'color' + i" 
            v-model="diceColors[i]"
          >
        </div>
        <div>
          <label for="modifier">Modifier (add to total):</label>
          <input 
            type="number" 
            id="modifier" 
            v-model.number="modifier"
          >
        </div>
        <div>
          <label for="min-success">Minimum for Success:</label>
          <input 
            type="number" 
            id="min-success" 
            v-model.number="minSuccess"
          >
        </div>
        <button type="submit">Roll Dice</button>
      </form>

      <div class="dice-area">
        <div 
          v-for="(val, i) in customResults" 
          :key="i" 
          class="dice" 
          :class="{ rolling: customResults.length > 0 && !val }"
          :style="{ '--dice-color': diceColors[i] }"
        >
          {{ val || '?' }}
        </div>
      </div>

      <div class="result" v-html="customResultText"></div>
    </div>

    <!-- Player (Esperanza y Miedo) Tab -->
    <div v-else class="tab-content">
      <form @submit.prevent="rollPlayer">
        <div>
          <button type="submit">Roll Hope and Fear</button>
        </div>
        <div class="input-group">
          <label for="player-modifier">Modifier (add to total):</label>
          <div class="input-with-buttons">
            <input 
              type="number" 
              id="player-modifier" 
              v-model.number="playerModifier"
            >
            <div class="quick-buttons">
              <button type="button" @click="playerModifier = 1">+1</button>
              <button type="button" @click="playerModifier = 2">+2</button>
              <button type="button" @click="playerModifier = 3">+3</button>
            </div>
          </div>
        </div>
        <div class="input-group">
          <label for="player-min-success">Minimum for Success:</label>
          <div class="input-with-buttons">
            <input 
              type="number" 
              id="player-min-success" 
              v-model.number="playerMinSuccess"
            >
            <div class="quick-buttons">
              <button type="button" @click="playerMinSuccess = 10">10</button>
              <button type="button" @click="playerMinSuccess = 13">13</button>
              <button type="button" @click="playerMinSuccess = 15">15</button>
            </div>
          </div>
        </div>
      </form>

      <div class="player-dice-container">
        <div class="dice-with-label">
          <div 
            class="dice" 
            :class="{ rolling: playerResults[0] === null }"
            style="--dice-color: #628141;"
          >
            {{ playerResults[0] || '?' }}
          </div>
          <div class="dice-label">Hope</div>
        </div>
        <div class="dice-with-label">
          <div 
            class="dice" 
            :class="{ rolling: playerResults[1] === null }"
            style="--dice-color: #FA6868;"
          >
            {{ playerResults[1] || '?' }}
          </div>
          <div class="dice-label">Fear</div>
        </div>
      </div>

      <div class="result" v-html="playerResultText"></div>
    </div>

    <!-- Roll History Panel -->
    <div class="history-panel" v-if="rollHistory.length > 0">
      <h3>Roll History</h3>
      <div class="history-items">
        <div 
          v-for="(roll, index) in rollHistory" 
          :key="index" 
          class="history-item"
          :class="{ 
            'critical-roll': roll.isCritical,
            'success-roll': roll.success && !roll.isCritical,
            'failure-roll': !roll.success && !roll.isCritical
          }"
        >
          <div class="history-time">{{ formatTime(roll.timestamp) }}</div>
          <div class="history-roll">
            <template v-if="roll.type === 'hope-fear'">
              <span class="dice-value hope">{{ roll.values[0] }}</span>
              <span class="dice-value fear">{{ roll.values[1] }}</span>
              <span v-if="roll.modifier"> + {{ roll.modifier }}</span>
              = <strong>{{ roll.total }}</strong>
              <span v-if="roll.isCritical" class="critical-badge">CRIT!</span>
              <span v-else-if="roll.success" class="success-badge">Success</span>
              <span v-else class="failure-badge">Failure</span>
            </template>
            <template v-else>
              <span v-for="(value, i) in roll.values" :key="i" class="dice-value">
                {{ value }}<span v-if="i < roll.values.length - 1">,</span>
              </span>
              <span v-if="roll.modifier"> + {{ roll.modifier }}</span>
              = <strong>{{ roll.total }}</strong>
              <span class="faces">(d{{ roll.faces }})</span>
              <span v-if="roll.success" class="success-badge">Success</span>
              <span v-else class="failure-badge">Failure</span>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const activeTab = ref('custom');

// Custom Dice State
const qty = ref(1);
const faces = ref(6);
const diceColors = ref(['#ff0000']);
const modifier = ref(0);
const minSuccess = ref(0);
const customResults = ref([]);
const customResultText = ref('');

// Player Dice State
const playerModifier = ref(0);
const playerMinSuccess = ref(10);  // Default minimum for success is 10
const playerResults = ref([null, null]);
const playerResultText = ref('');
const isCritical = ref(false);

// Roll History State
const rollHistory = ref([]);
const maxHistoryItems = 10;

// Helper function to add rolls to history
function addToHistory(rollData) {
  rollHistory.value.unshift({
    ...rollData,
    timestamp: new Date()
  });
  
  // Keep only the last maxHistoryItems rolls
  if (rollHistory.value.length > maxHistoryItems) {
    rollHistory.value = rollHistory.value.slice(0, maxHistoryItems);
  }
}

// Helper function to format time
function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
}

// Update color pickers when quantity changes
watch(qty, (newQty) => {
  while (diceColors.value.length < newQty) {
    diceColors.value.push('#ff0000');
  }
  while (diceColors.value.length > newQty) {
    diceColors.value.pop();
  }
});

function rollCustom() {
  customResults.value = [];
  customResultText.value = '';
  
  // Show rolling animation
  customResults.value = Array(qty.value).fill(null);
  
  setTimeout(() => {
    customResults.value = Array.from({ length: qty.value }, () => 
      Math.floor(Math.random() * faces.value) + 1
    );
    
    const sum = customResults.value.reduce((a, b) => a + b, 0);
    const total = sum + modifier.value;
    
    const isSuccess = total >= minSuccess.value;
    const resultClass = isSuccess ? 'success' : 'failure';
    const resultText = isSuccess ? 'Success!' : 'Failure.';
    
    customResultText.value = `
      <p>Value: ${sum}</p>
      <p>Modifier: ${modifier.value}</p>
      <p>Total: ${total}</p>
      <p class="${resultClass}">${resultText}</p>
    `;
    
    // Add to roll history
    addToHistory({
      type: 'custom',
      values: [...customResults.value],
      total,
      isCritical: false,
      modifier: modifier.value,
      faces: faces.value,
      success: isSuccess
    });
  }, 300);
}

function rollPlayer() {
  playerResultText.value = '';
  playerResults.value = [null, null];
  isCritical.value = false;
  
  setTimeout(() => {
    const valHope = Math.floor(Math.random() * 12) + 1;
    const valFear = Math.floor(Math.random() * 12) + 1;
    playerResults.value = [valHope, valFear];
    
    const sum = valHope + valFear;
    const total = sum + playerModifier.value;
    
    // Check for critical hit (pair)
    isCritical.value = valHope === valFear;
    
    // Determine which die is higher (only used for non-critical rolls)
    const higherDie = valHope > valFear ? 'hope' : (valFear > valHope ? 'fear' : 'tie');
    
    // Create base result text
    let resultText = `
      <p>Hope: ${valHope}</p>
      <p>Fear: ${valFear}</p>
      <p>Modifier: ${playerModifier.value}</p>
      <p>Total: ${total}</p>
    `;
    
    // Handle critical success (pair)
    if (isCritical.value) {
      resultText = `
        <p class="critical-text">Critical Hit! 🎯</p>
        ${resultText}
        <p class="success">Critical Success with ${valHope}!</p>
      `;
    }
    // Handle regular success/failure
    else if (total >= playerMinSuccess.value) {
      if (higherDie === 'tie') {
        resultText += `<p class="success">Success with both Hope and Fear</p>`;
      } else {
        resultText += `<p class="success">Success with ${higherDie.charAt(0).toUpperCase() + higherDie.slice(1)}</p>`;
      }
    } else {
      if (higherDie === 'tie') {
        resultText += `<p class="failure">Failure with both Hope and Fear</p>`;
      } else {
        resultText += `<p class="failure">Failure with ${higherDie.charAt(0).toUpperCase() + higherDie.slice(1)}</p>`;
      }
    }
    
    // Assign the final result text
    playerResultText.value = resultText;
    
    // Add to roll history
    addToHistory({
      type: 'hope-fear',
      values: [valHope, valFear],
      total,
      isCritical: isCritical.value,
      modifier: playerModifier.value,
      success: isCritical.value || total >= playerMinSuccess.value
    });
  }, 300);
}
</script>

<style lang="scss">
@import './DiceRoller/DiceRoller.scss';
</style>
