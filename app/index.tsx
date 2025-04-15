import { decrement, increment } from '@/features/counterSlice';
import { RootState } from '@/store';
import { Pressable, Text } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

export default function HomeScreen() {
   const count = useSelector((state: RootState) => state.counter.value);
  const dispatch = useDispatch()

 return (
   <SafeAreaView className="flex-row items-center justify-center space-x-4">
     <Pressable
       accessibilityLabel="Increment value"
       onPress={() => dispatch(increment())}
       className="bg-blue-500 px-4 py-2 rounded"
     >
       <Text className="text-white font-bold">Increment</Text>
     </Pressable>

     <Text className="text-lg font-semibold">{count}</Text>

     <Pressable
       accessibilityLabel="Decrement value"
       onPress={() => dispatch(decrement())}
       className="bg-red-500 px-4 py-2 rounded"
     >
       <Text className="text-white font-bold">Decrement</Text>
     </Pressable>
   </SafeAreaView>
 );
}