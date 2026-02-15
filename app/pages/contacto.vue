<script setup lang="ts">
import { reactive, ref } from "vue"
import {sendContactMessage} from "~/composables/api/contactApi";

export interface ContactRequestDto {
  name: string
  email: string
  message: string
  phoneNumber: string
}

const form = reactive<ContactRequestDto>({
  name: "",
  email: "",
  message: "",
  phoneNumber: ""
})

const loading = ref(false)
const success = ref(false)
const error = ref<string | null>(null)

function validate(): boolean {
  if (!form.name || !form.email || !form.message) {
    error.value = "Por favor, completa los campos obligatorios."
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email)) {
    error.value = "El email no es válido."
    return false
  }

  error.value = null
  return true
}

async function handleSubmit() {
  if (!validate()) return

  loading.value = true
  success.value = false

  try {
    console.log("Enviando:", form)

    await sendContactMessage(form)
    
    success.value = true

    Object.assign(form, {
      name: "",
      email: "",
      message: "",
      phoneNumber: ""
    })
  } catch (e) {
    error.value = "Ha ocurrido un error al enviar el mensaje."
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="contact-section">

    <!-- CARD INFO IZQUIERDA -->
    <div class="info-card">
      <h2>¿Prefieres otra vía de contacto?</h2>
      <p class="info-text">
        También puedes comunicarte con nosotros mediante:
      </p>

      <div class="contact-methods">

        <div class="method">
          <div class="icon-circle">📞</div>
          <div>
            <strong>Teléfono</strong>
            <p>+34 600 123 456</p>
          </div>
        </div>

        <div class="method">
          <div class="icon-circle">✉️</div>
          <div>
            <strong>Email</strong>
            <p>contacto@tudominio.com</p>
          </div>
        </div>

      </div>
    </div>

    <!-- CARD FORMULARIO DERECHA -->
    <form class="contact-form" @submit.prevent="handleSubmit">

      <h2 class="title">Contacto</h2>

      <div class="field">
        <label>Nombre *</label>
        <input v-model="form.name" type="text" placeholder="Tu nombre" />
      </div>

      <div class="field">
        <label>Email *</label>
        <input v-model="form.email" type="email" placeholder="Tu email" />
      </div>

      <div class="field">
        <label>Teléfono</label>
        <input v-model="form.phoneNumber" type="tel" placeholder="Tu teléfono" />
      </div>

      <div class="field">
        <label>Mensaje *</label>
        <textarea v-model="form.message" rows="5" placeholder="Escribe tu mensaje"></textarea>
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? "Enviando..." : "Enviar mensaje" }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">Mensaje enviado correctamente ✅</p>
    </form>

  </section>
</template>

<style scoped>

/* CONTENEDOR GENERAL */
.contact-section {
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 4rem;
  padding: 4rem 2rem;
  flex-wrap: wrap;
}

/* CARD BASE */
.info-card,
.contact-form {
  flex: 1;
  min-width: 300px;
  max-width: 520px;
  padding: 2.5rem;
  border-radius: 16px;
  background: var(--color-bg);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

/* INFO CARD */
.info-card h2 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.info-text {
  margin-bottom: 2rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.contact-methods {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.method {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-circle {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
}

/* FORMULARIO */
.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.3rem;
  color: #2c3e50;
}

.title {
  text-align: center;
  font-size: 1.8rem;
  font-weight: 600;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

label {
  font-size: 0.9rem;
  font-weight: 500;
}

input,
textarea {
  padding: 0.75rem 0.9rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #f5f5f5;
  font-size: 0.95rem;
  transition: all 0.25s ease;
}

input::placeholder,
textarea::placeholder {
  color: var(--color-placeholder);
  opacity: 1;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
}

/* BOTÓN */
button {
  margin-top: 0.5rem;
  padding: 0.85rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: var(--color-primary);
  color: white;
}

button:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-2px);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* MENSAJES */
.error {
  color: var(--color-error);
  font-size: 0.9rem;
  text-align: center;
}

.success {
  color: var(--color-success);
  font-size: 0.9rem;
  text-align: center;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .contact-section {
    flex-direction: column-reverse;
    gap: 3rem;
  }
}

</style>

