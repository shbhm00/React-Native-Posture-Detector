package com.deviceposture

import android.content.pm.PackageManager
import android.os.Build
import androidx.core.util.Consumer
import androidx.window.java.layout.WindowInfoTrackerCallbackAdapter
import androidx.window.layout.FoldingFeature
import androidx.window.layout.WindowInfoTracker
import androidx.window.layout.WindowLayoutInfo
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

class DevicePostureModule(reactContext: ReactApplicationContext) :
  NativeDevicePostureSpec(reactContext), LifecycleEventListener {

  private data class Posture(
    val isFoldSupported: Boolean,
    val status: String,
    val isFlat: Boolean,
  )

  private val executor: ExecutorService = Executors.newSingleThreadExecutor()
  private var tracker: WindowInfoTrackerCallbackAdapter? = null
  private var listening = false

  @Volatile private var posture = Posture(false, "unknown", false)

  private val layoutCallback =
    Consumer<WindowLayoutInfo> { info ->
      publish(info)
    }

  init {
    if (hasHinge()) {
      tracker = WindowInfoTrackerCallbackAdapter(WindowInfoTracker.getOrCreate(reactContext))
      posture = Posture(true, "unknown", false)
    }
    reactContext.addLifecycleEventListener(this)
  }

  override fun getName(): String = NAME

  override fun getFoldState(): WritableMap = posture.toMap()

  override fun startListening() {
    listening = true
    attachListener()
  }

  override fun stopListening() {
    listening = false
    detachListener()
  }

  override fun onHostResume() {
    if (listening) {
      attachListener()
    }
  }

  override fun onHostPause() = Unit

  override fun onHostDestroy() {
    stopListening()
    reactApplicationContext.removeLifecycleEventListener(this)
    executor.shutdown()
  }

  private fun attachListener() {
    val activity = reactApplicationContext.currentActivity
    val windowTracker = tracker
    if (!listening || activity == null || windowTracker == null) {
      return
    }
    windowTracker.removeWindowLayoutInfoListener(layoutCallback)
    windowTracker.addWindowLayoutInfoListener(activity, executor, layoutCallback)
  }

  private fun detachListener() {
    tracker?.removeWindowLayoutInfoListener(layoutCallback)
  }

  private fun publish(info: WindowLayoutInfo) {
    val supported = hasHinge()
    val foldingFeature = info.displayFeatures.filterIsInstance<FoldingFeature>().firstOrNull()
    val next =
      when {
        !supported -> Posture(false, "unknown", false)
        foldingFeature == null -> Posture(true, "closed", false)
        foldingFeature.state == FoldingFeature.State.FLAT -> Posture(true, "fullyOpen", true)
        foldingFeature.state == FoldingFeature.State.HALF_OPENED ->
          Posture(true, "partiallyOpen", false)
        else -> Posture(true, "unknown", false)
      }

    if (next == posture) {
      return
    }
    posture = next
    val snapshot = next
    reactApplicationContext.runOnUiQueueThread {
      emitOnFoldStateChange(snapshot.toMap())
    }
  }

  private fun hasHinge(): Boolean {
    val feature =
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        PackageManager.FEATURE_SENSOR_HINGE_ANGLE
      } else {
        "android.hardware.sensor.hinge_angle"
      }
    return reactApplicationContext.packageManager.hasSystemFeature(feature)
  }

  private fun Posture.toMap(): WritableMap {
    return Arguments.createMap().apply {
      putBoolean("isFoldSupported", isFoldSupported)
      putString("status", status)
      putBoolean("isFlat", isFlat)
    }
  }

  companion object {
    const val NAME = "NativeDevicePosture"
  }
}
