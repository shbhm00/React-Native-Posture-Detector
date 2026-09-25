import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import type { EventEmitter } from 'react-native/Libraries/Types/CodegenTypes';

export type FoldState = {
  isFoldSupported: boolean;
  status: string;
  isFlat: boolean;
};

export interface Spec extends TurboModule {
  getFoldState(): FoldState;
  startListening(): void;
  stopListening(): void;
  /**
   * Shared listener for iOS and Android. The property name is `onFoldStateChange`.
   */
  readonly onFoldStateChange: EventEmitter<FoldState>;
}

export default TurboModuleRegistry.get<Spec>('NativeDevicePosture');
