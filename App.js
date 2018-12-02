import React from 'react';
import {
  createStackNavigator, 
  createAppContainer
} from 'react-navigation';
import LoginScreen from './src/components/LoginScreen/LoginScreen';

const MainNavigator = createStackNavigator({
  LoginScreen: {
    screen: LoginScreen
  }
});

const App = createAppContainer(MainNavigator);

export default App;
