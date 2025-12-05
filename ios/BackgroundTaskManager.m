#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(BackgroundTaskManager, NSObject)

RCT_EXTERN_METHOD(startBackgroundTask)
RCT_EXTERN_METHOD(endBackgroundTask)

@end
