package com.deviceposture

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class DevicePosturePackage : BaseReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    return if (name == DevicePostureModule.NAME) {
      DevicePostureModule(reactContext)
    } else {
      null
    }
  }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
    return ReactModuleInfoProvider {
      mapOf(
        DevicePostureModule.NAME to ReactModuleInfo(
          DevicePostureModule.NAME,
          DevicePostureModule::class.java.name,
          false,
          true,
          false,
          true
        )
      )
    }
  }
}
