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

        <el-tab-pane label="ID Login" name="idLogin">
          <el-form
            ref="idLoginFormRef"
            :model="idLoginForm"
            :rules="idLoginRules"
            label-position="top"
            class="w-full"
          >
            <el-form-item label="ID" prop="username">
              <el-input
                v-model="idLoginForm.username"
                placeholder="Enter your ID"
                clearable
              />
            </el-form-item>

            <el-form-item label="Password" prop="password">
              <el-input
                v-model="idLoginForm.password"
                type="password"
                placeholder="Enter your password"
                show-password
              />
            </el-form-item>

            <template v-if="needEmailBinding">
              <el-form-item label="Email" prop="email">
                <el-input
                  v-model="idLoginForm.email"
                  placeholder="Enter your email"
                  clearable
                />
              </el-form-item>

              <el-form-item label="Email Code" prop="emailCode">
                <div class="flex items-center w-full gap-2">
                  <el-input
                    v-model="idLoginForm.emailCode"
                    placeholder="Enter email code"
                    maxlength="6"
                    class="flex-1"
                  />
                  <el-button
                    :loading="emailLoading"
                    @click="sendEmailCaptchaForIdLogin"
                    type="primary"
                    plain
                    class="border-[#4f46e5] text-[#4f46e5]"
                  >
                    Send
                  </el-button>
                </div>
              </el-form-item>
            </template>

            <el-form-item label="Captcha" prop="code">
              <div class="flex items-center w-full gap-2">
                <el-input
                  v-model="idLoginForm.code"
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

            <el-form-item>
              <el-button
                type="primary"
                class="w-full gradient-btn"
                size="large"
                :loading="loading"
                @click="onIdLogin"
              >
                Login with ID
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { saveAuth, clearAuth } from '@/net'
import { AuthApi } from '@/api'
const router = useRouter()

const activeTab = ref<'login' | 'register' | 'idLogin'>('login')
const loginFormRef = ref()
const registerFormRef = ref()
const idLoginFormRef = ref()

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

const idLoginForm = reactive({
  username: '',
  password: '',
  email: '',
  emailCode: '',
  code: '',
})

const idLoginRules = computed(() => ({
  username: [
    { required: true, message: 'Please input ID', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Please input password', trigger: 'blur' },
    { min: 4, message: 'Password length should be at least 4 characters', trigger: 'blur' },
  ],
  email: needEmailBinding.value ? [
    { required: true, message: 'Please input email', trigger: 'blur' },
    { type: 'email', message: 'Invalid email', trigger: 'blur' },
  ] : [],
  emailCode: needEmailBinding.value ? [
    { required: true, message: 'Please input email code', trigger: 'blur' },
  ] : [],
  code: [
    { required: true, message: 'Please input captcha', trigger: 'blur' },
  ],
}))

const loading = ref(false)
const emailLoading = ref(false)
const needEmailBinding = ref(false)
const captchaUuid = ref<string | null>(null)
const captchaImg = ref<string>('')
const captchaSrc = computed(() => {
  if (!captchaImg.value) return ''
  // 后端可能已返回 data:image/png;base64, 前缀；避免重复拼接
  return captchaImg.value.startsWith('data:') ? captchaImg.value : `data:image/png;base64,${captchaImg.value}`
})

const refreshCaptcha = async () => {
  try {
    const resp = await AuthApi.getImageCaptcha()
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

// 监听标签页切换，重置邮箱绑定状态
watch(activeTab, (newTab) => {
  if (newTab !== 'idLogin') {
    needEmailBinding.value = false
    idLoginForm.email = ''
    idLoginForm.emailCode = ''
  }
})

const onSubmit = () => {
  if (activeTab.value === 'login') {
    doLogin()
  } else if (activeTab.value === 'register') {
    doRegister()
  }
}

const onIdLogin = () => {
  doIdLogin()
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

    AuthApi.login(payload)
      .then((resp) => {
        const data = resp.data as { token?: string; user?: { admin?: number } }
        const token = data.token
        const user = data.user

        saveAuth(token, user)

        ElMessage.success('Login successful')

        // 根据用户角色跳转：管理员跳转到 /admin，普通用户跳转到 /home
        if (user && user.admin === 1) {
          router.push('/admin')
        } else {
          router.push('/home')
        }
      })
      .catch((err: unknown) => {
        console.error(err)
        ElMessage.error('Login failed')
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
    await AuthApi.getEmailCaptcha(registerForm.email)
    ElMessage.success('Verification code sent to email')
  } catch (err: unknown) {
    console.error(err)
    ElMessage.error('Send failed')
  } finally {
    emailLoading.value = false
  }
}

const sendEmailCaptchaForIdLogin = async () => {
  if (!idLoginForm.email) {
    ElMessage.warning('Please input email first')
    return
  }
  emailLoading.value = true
  try {
    await AuthApi.getEmailCaptcha(idLoginForm.email)
    ElMessage.success('Verification code sent to email')
  } catch (err: unknown) {
    console.error(err)
    ElMessage.error('Send failed')
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
      username: registerForm.username,
      password: registerForm.password,
      email: registerForm.email,
      code: registerForm.emailCode,
    }

    AuthApi.register(payload)
      .then(() => {
        ElMessage.success('Register successful, please login')
        activeTab.value = 'login'
        clearAuth()
        refreshCaptcha()
      })
      .catch((err: unknown) => {
        console.error(err)
        ElMessage.error('Register failed')
      })
      .finally(() => {
        loading.value = false
      })
  })
}

const doIdLogin = () => {
  if (!idLoginFormRef.value) return
  loading.value = true

  idLoginFormRef.value.validate((valid: boolean) => {
    if (!valid) {
      loading.value = false
      return
    }

    if (!captchaUuid.value) {
      ElMessage.error('Captcha not loaded, please click to refresh')
      loading.value = false
      return
    }

    const payload: {
      username: string
      password: string
      uuid: string
      code: string
      email?: string
      emailCode?: string
    } = {
      username: idLoginForm.username,
      password: idLoginForm.password,
      uuid: captchaUuid.value,
      code: idLoginForm.code,
    }

    // 如果需要绑定邮箱，则添加邮箱和验证码
    if (needEmailBinding.value) {
      payload.email = idLoginForm.email
      payload.emailCode = idLoginForm.emailCode
    }

    AuthApi.loginYnu(payload)
      .then((resp) => {
        const data = resp.data as { token?: string; user?: { admin?: number } }
        const token = data.token
        const user = data.user

        saveAuth(token, user)

        ElMessage.success('Login successful')
        
        // 重置邮箱绑定状态
        needEmailBinding.value = false
        idLoginForm.email = ''
        idLoginForm.emailCode = ''

        // 根据用户角色跳转：管理员跳转到 /admin，普通用户跳转到 /home
        if (user && user.admin === 1) {
          router.push('/admin')
        } else {
          router.push('/home')
        }
      })
      .catch((err: unknown) => {
        console.error('Login error:', err)
        const error = err as { 
          response?: { 
            data?: { 
              error?: string
              message?: string
              needEmailBinding?: boolean
            }
            status?: number
          }
          message?: string
        }
        
        const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || ''
        const errorLower = errorMessage.toLowerCase()
        
        console.log('Error message:', errorMessage)
        console.log('Error response:', error?.response)
        
        // 检查是否需要绑定邮箱 - 更宽松的检测条件
        if (error?.response?.data?.needEmailBinding === true ||
            error?.response?.status === 400 && (
              errorLower.includes('email') ||
              errorLower.includes('bind') ||
              errorLower.includes('绑定') ||
              errorLower.includes('邮箱')
            ) ||
            errorLower.includes('email binding') ||
            errorLower.includes('bind email') ||
            errorLower.includes('需要绑定') ||
            errorLower.includes('请绑定')) {
          console.log('Setting needEmailBinding to true')
          needEmailBinding.value = true
          ElMessage.warning('Please bind your email to complete login')
          // 刷新验证码
          refreshCaptcha()
        } else {
          // 如果是 400 错误，可能是需要绑定邮箱，尝试显示邮箱字段
          if (error?.response?.status === 400 && !needEmailBinding.value) {
            console.log('400 error detected, showing email binding fields')
            needEmailBinding.value = true
            ElMessage.warning('Please bind your email to complete login')
            refreshCaptcha()
          } else {
            ElMessage.error(errorMessage || 'Login failed')
            // 刷新验证码，防止重复使用
            refreshCaptcha()
          }
        }
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


