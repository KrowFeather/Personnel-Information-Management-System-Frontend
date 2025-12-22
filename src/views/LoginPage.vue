<template>
  <div class="w-full h-screen flex items-center justify-center login-bg">
    <div
      class="w-[420px] bg-white shadow-xl rounded-2xl p-8 flex flex-col items-center gap-6 border border-[#e5e7eb]"
    >
      <div class="text-center">
        <h1 class="text-2xl font-bold text-[#0f172a] mb-1">Fake Discord</h1>
        <p class="text-gray-500 text-sm">Personnel Information Management System</p>
      </div>

      <el-tabs v-model="activeTab" class="w-full custom-tabs">
        <el-tab-pane label="Login" name="login">
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            label-position="top"
            class="w-full"
          >
            <el-form-item label="Username" prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="Enter your username"
                clearable
              />
            </el-form-item>

            <el-form-item label="Password" prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="Enter your password"
                show-password
              />
            </el-form-item>

            <el-form-item label="Captcha" prop="code">
              <div class="flex items-center w-full gap-2">
                <el-input
                  v-model="loginForm.code"
                  placeholder="Enter image captcha"
                  maxlength="6"
                  class="flex-1"
                />
                <div
                  class="w-[120px] h-[40px] border border-gray-200 rounded cursor-pointer flex items-center justify-center bg-gray-50"
                  @click="refreshCaptcha"
                >
                  <img
                    v-if="captchaImg"
                    :src="captchaSrc"
                    alt="captcha"
                    class="w-full h-full object-contain"
                  />
                  <span v-else class="text-xs text-gray-400">Click to load</span>
                </div>
              </div>
            </el-form-item>

            <div class="flex items-center justify-between mb-2">
              <el-checkbox v-model="loginForm.remember">Remember me</el-checkbox>
              <span class="text-xs text-blue-500 cursor-pointer hover:underline">
                Forgot password?
              </span>
            </div>

            <el-form-item>
              <el-button
                type="primary"
                class="w-full gradient-btn"
                size="large"
                :loading="loading"
                @click="onSubmit"
              >
                Login
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="Register" name="register">
          <el-form
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            label-position="top"
            class="w-full"
          >
            <el-form-item label="Username" prop="username">
              <el-input
                v-model="registerForm.username"
                placeholder="Enter your username"
                clearable
              />
            </el-form-item>

            <el-form-item label="Password" prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="Enter your password"
                show-password
              />
            </el-form-item>

            <el-form-item label="Email" prop="email">
              <el-input
                v-model="registerForm.email"
                placeholder="Enter your email"
                clearable
              />
            </el-form-item>

            <el-form-item label="Email Code" prop="emailCode">
              <div class="flex items-center w-full gap-2">
                <el-input
                  v-model="registerForm.emailCode"
                  placeholder="Enter email code"
                  maxlength="6"
                  class="flex-1"
                />
                <el-button
                  :loading="emailLoading"
                  @click="sendEmailCaptcha"
                  type="primary"
                  plain
                  class="border-[#4f46e5] text-[#4f46e5]"
                >
                  Send
                </el-button>
              </div>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                class="w-full gradient-btn"
                size="large"
                :loading="loading"
                @click="onSubmit"
              >
                Register
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <p class="text-xs text-gray-400">
        Login/Register call backend <code>/auth/login</code> / <code>/auth/register</code>.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { AxiosError } from 'axios'
import { api, saveAuth, clearAuth } from '@/net'
const router = useRouter()

const activeTab = ref<'login' | 'register'>('login')
const loginFormRef = ref()
const registerFormRef = ref()

const loginForm = reactive({
  username: '',
  password: '',
  code: '',
  remember: true,
})

const loginRules = {
  username: [
    { required: true, message: 'Please input username', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Please input password', trigger: 'blur' },
    { min: 4, message: 'Password length should be at least 4 characters', trigger: 'blur' },
  ],
  code: [
    { required: true, message: 'Please input captcha', trigger: 'blur' },
  ],
}

const registerForm = reactive({
  username: '',
  password: '',
  email: '',
  emailCode: '',
})

const registerRules = {
  username: [
    { required: true, message: 'Please input username', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Please input password', trigger: 'blur' },
    { min: 4, message: 'Password length should be at least 4 characters', trigger: 'blur' },
  ],
  email: [
    { required: true, message: 'Please input email', trigger: 'blur' },
    { type: 'email', message: 'Invalid email', trigger: 'blur' },
  ],
  emailCode: [
    { required: true, message: 'Please input email code', trigger: 'blur' },
  ],
}

const loading = ref(false)
const emailLoading = ref(false)
const captchaUuid = ref<string | null>(null)
const captchaImg = ref<string>('')
const captchaSrc = computed(() => {
  if (!captchaImg.value) return ''
  // 后端可能已返回 data:image/png;base64, 前缀；避免重复拼接
  return captchaImg.value.startsWith('data:') ? captchaImg.value : `data:image/png;base64,${captchaImg.value}`
})

const refreshCaptcha = async () => {
  try {
    const resp = await api.get('/auth/get-image-captcha')
    captchaUuid.value = resp.data.uuid
    captchaImg.value = resp.data.base64Img
  } catch (e) {
    console.error(e)
    ElMessage.error('Failed to load captcha, please try again')
  }
}

onMounted(() => {
  refreshCaptcha()
})

const onSubmit = () => {
  if (activeTab.value === 'login') {
    doLogin()
  } else {
    doRegister()
  }
}

const doLogin = () => {
  if (!loginFormRef.value) return
  loading.value = true

  loginFormRef.value.validate((valid: boolean) => {
    if (!valid) {
      loading.value = false
      return
    }

    if (!captchaUuid.value) {
      ElMessage.error('Captcha not loaded, please click to refresh')
      loading.value = false
      return
    }

    const payload = {
      username: loginForm.username,
      password: loginForm.password,
      uuid: captchaUuid.value,
      code: loginForm.code,
    }

    api.post('/auth/login', payload)
      .then((resp) => {
        const data: { token?: string; user?: unknown; error?: string; message?: string } = resp.data || {}
        const token = data.token
        const user = data.user

        saveAuth(token, user)

        ElMessage.success('Login successful')
        router.push('/home')
      })
      .catch((err: AxiosError<{ error?: string; message?: string }>) => {
        console.error(err)
        const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Login failed'
        ElMessage.error(msg)
        // 刷新验证码，防止重复使用
        refreshCaptcha()
      })
      .finally(() => {
        loading.value = false
      })
  })
}

const sendEmailCaptcha = async () => {
  if (!registerForm.email) {
    ElMessage.warning('Please input email first')
    return
  }
  emailLoading.value = true
  try {
    await api.get('/auth/get-email-captcha', {
      params: { email: registerForm.email },
    })
    ElMessage.success('Verification code sent to email')
  } catch (err: unknown) {
    const axiosErr = err as AxiosError<{ error?: string; message?: string }>
    const msg = axiosErr?.response?.data?.error || axiosErr?.response?.data?.message || axiosErr?.message || 'Send failed'
    ElMessage.error(msg)
  } finally {
    emailLoading.value = false
  }
}

const doRegister = () => {
  if (!registerFormRef.value) return
  loading.value = true

  registerFormRef.value.validate((valid: boolean) => {
    if (!valid) {
      loading.value = false
      return
    }

    const payload = {
      useranme: registerForm.username, // 后端 DTO 拼写为 useranme
      password: registerForm.password,
      email: registerForm.email,
      code: registerForm.emailCode,
    }

    api.post('/auth/register', payload)
      .then(() => {
        ElMessage.success('Register successful, please login')
        activeTab.value = 'login'
        clearAuth()
        refreshCaptcha()
      })
      .catch((err: AxiosError<{ error?: string; message?: string }>) => {
        console.error(err)
        const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Register failed'
        ElMessage.error(msg)
      })
      .finally(() => {
        loading.value = false
      })
  })
}
</script>

<style scoped>
.login-bg {
  background: radial-gradient(circle at 20% 20%, #e0e7ff 0, transparent 25%),
    radial-gradient(circle at 80% 0%, #c7d2fe 0, transparent 28%),
    linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
}

.el-form-item {
  margin-bottom: 16px;
}

.gradient-btn {
  background-image: linear-gradient(120deg, #6366f1 0%, #8b5cf6 50%, #6366f1 100%);
  color: #fff;
  border: none;
}

.gradient-btn:hover {
  filter: brightness(1.02);
}

.custom-tabs :deep(.el-tabs__item.is-active) {
  color: #4f46e5;
}

.custom-tabs :deep(.el-tabs__active-bar) {
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
}

.custom-tabs :deep(.el-tabs__nav-wrap::after) {
  background-color: #e5e7eb;
}
</style>


