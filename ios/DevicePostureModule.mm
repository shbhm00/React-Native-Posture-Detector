#import <RNDevicePostureSpec/RNDevicePostureSpec.h>
#import <UIKit/UIHinge.h>
#import <UIKit/UIHingeInteraction.h>
#import <objc/runtime.h>

@class DevicePostureModule;

static NSDictionary *DevicePostureCurrentState;
static __weak DevicePostureModule *DevicePostureInstance;
static const void *DevicePostureInteractionKey = &DevicePostureInteractionKey;

static NSDictionary *DevicePostureState(BOOL isFoldSupported, NSString *status, BOOL isFlat)
{
  return @{
    @"isFoldSupported" : @(isFoldSupported),
    @"status" : status ?: @"unknown",
    @"isFlat" : @(isFlat),
  };
}

static UIView *DevicePostureRootView(void)
{
  for (UIScene *scene in UIApplication.sharedApplication.connectedScenes) {
    if (![scene isKindOfClass:[UIWindowScene class]]) {
      continue;
    }
    UIWindowScene *windowScene = (UIWindowScene *)scene;
    for (UIWindow *window in windowScene.windows) {
      if (window.isKeyWindow && window.rootViewController.view != nil) {
        return window.rootViewController.view;
      }
    }
  }
  return nil;
}

@interface DevicePostureModule : NativeDevicePostureSpecBase <NativeDevicePostureSpec>
+ (void)applySupported:(BOOL)isFoldSupported status:(NSString *)status isFlat:(BOOL)isFlat;
- (void)attachHingeObserver;
- (void)detachHingeObserver;
@end

@implementation DevicePostureModule

RCT_EXPORT_MODULE(NativeDevicePosture);

+ (void)initialize
{
  if (self == [DevicePostureModule class] && DevicePostureCurrentState == nil) {
    DevicePostureCurrentState = DevicePostureState(NO, @"unknown", NO);
  }
}

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

- (instancetype)init
{
  if (self = [super init]) {
    DevicePostureInstance = self;
  }
  return self;
}

- (void)startListening
{
  dispatch_async(dispatch_get_main_queue(), ^{
    [self attachHingeObserver];
  });
}

- (void)stopListening
{
  dispatch_async(dispatch_get_main_queue(), ^{
    [self detachHingeObserver];
  });
}

- (void)attachHingeObserver
{
  if (@available(iOS 27.1, *)) {
    UIView *view = DevicePostureRootView();
    if (view == nil || objc_getAssociatedObject(view, DevicePostureInteractionKey) != nil) {
      return;
    }

    UIHingeInteraction *interaction = [[UIHingeInteraction alloc]
        initWithUpdateHandler:^(__unused UIHingeInteraction *hingeInteraction,
                                UIHingeInteractionUpdate *update) {
          UIHinge *hinge = update.hinge;
          if (hinge == nil) {
            [DevicePostureModule applySupported:NO status:@"unknown" isFlat:NO];
            return;
          }

          switch (hinge.status) {
            case UIHingeStatusClosed:
              [DevicePostureModule applySupported:YES status:@"closed" isFlat:NO];
              break;
            case UIHingeStatusPartiallyOpen:
              [DevicePostureModule applySupported:YES status:@"partiallyOpen" isFlat:NO];
              break;
            case UIHingeStatusFullyOpen:
              [DevicePostureModule applySupported:YES status:@"fullyOpen" isFlat:YES];
              break;
            default:
              [DevicePostureModule applySupported:YES status:@"unknown" isFlat:NO];
              break;
          }
        }];

    objc_setAssociatedObject(
        view, DevicePostureInteractionKey, interaction, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    [view addInteraction:interaction];
  }
}

- (void)detachHingeObserver
{
  if (@available(iOS 27.1, *)) {
    UIView *view = DevicePostureRootView();
    id interaction = view ? objc_getAssociatedObject(view, DevicePostureInteractionKey) : nil;
    if (view != nil && interaction != nil) {
      [view removeInteraction:interaction];
      objc_setAssociatedObject(view, DevicePostureInteractionKey, nil, OBJC_ASSOCIATION_ASSIGN);
    }
  }
}

+ (void)applySupported:(BOOL)isFoldSupported status:(NSString *)status isFlat:(BOOL)isFlat
{
  void (^apply)(void) = ^{
    NSDictionary *next = DevicePostureState(isFoldSupported, status, isFlat);
    if ([DevicePostureCurrentState isEqualToDictionary:next]) {
      return;
    }
    DevicePostureCurrentState = next;
    DevicePostureModule *module = DevicePostureInstance;
    if (module != nil) {
      [module emitOnFoldStateChange:next];
    }
  };

  if ([NSThread isMainThread]) {
    apply();
  } else {
    dispatch_async(dispatch_get_main_queue(), apply);
  }
}

- (NSDictionary *)getFoldState
{
  return DevicePostureCurrentState ?: DevicePostureState(NO, @"unknown", NO);
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeDevicePostureSpecJSI>(params);
}

@end
