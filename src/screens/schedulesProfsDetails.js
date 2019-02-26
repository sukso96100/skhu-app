import React, {Component} from 'react';
import {ScrollView, Text, View, ActivityIndicator} from 'react-native';
import {CardItem} from '../components/components';
import { MaterialIcons } from '@expo/vector-icons';
import {Linking} from 'expo';
import ForestApi from '../tools/apis';
import BuildConfigs from '../config';

export default class SyllabusDetails extends Component{
  static navigationOptions = ({ navigation, navigationOptions }) => {
    const { params } = navigation.state;

    return {
      title: '교수님별 시간표 조회 결과 확인',
    };
  };
  constructor(props){
    super(props);
    this.state = {
      subjectCode: this.props.navigation.getParam('subjectCode',''),
      classCode: this.props.navigation.getParam('classCode',''),
      semesterCode: this.props.navigation.getParam('semesterCode',''),
      year: this.props.navigation.getParam('year',''),
      details: undefined,
      isLoading: false
    };
  }
  componentDidMount(){

    this.loadSearchResults();
  }
  render(){
    if(this.state.isLoading){
      return(
        <View style={{justifyContent: 'center', padding: 32}}>
          <ActivityIndicator size="large" color={BuildConfigs.primaryColor} />
        </View>
      );
      }else{
        return(<View></View>);
      }
    }
  }

  async loadSearchResults(){
    try{
      this.setState({isLoading: true});
      const details = await ForestApi.postToSam(
        '/SSE/SSEAD/SSEAD05_GetList',
        JSON.stringify({
          'ActionMode': 'R',
          'Bunban':this.state.classCode,
          'GwamogCd':this.state.subjectCode,
          'Haggi':this.state.semesterCode,
          'Yy':this.state.year,
        }));
      if(details.ok){
        const data = await details.json();
        this.setState({
          details: data.DAT,
          isLoading: false
        });
      }
    }catch(err){
      console.log(err);
    }
  }
}
