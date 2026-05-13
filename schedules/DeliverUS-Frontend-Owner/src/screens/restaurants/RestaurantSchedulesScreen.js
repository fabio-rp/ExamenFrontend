/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, FlatList, Pressable, View } from 'react-native'

import { getRestaurantSchedules, removeSchedule } from '../../api/RestaurantEndpoints'
import ImageCard from '../../components/ImageCard'
import TextSemiBold from '../../components/TextSemibold'
import TextRegular from '../../components/TextRegular'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import { showMessage } from 'react-native-flash-message'
import DeleteModal from '../../components/DeleteModal'
import scheduleIcon from '../../../assets/schedule.png'

export default function RestaurantSchedulesScreen ({ navigation, route }) {
  const { loggedInUser } = useContext(AuthorizationContext)
  const [schedules, setSchedules] = useState([])
  const [scheduleToBeRemoved, setScheduleToBeRemoved] = useState(null)

  useEffect(() => {
    if (loggedInUser) {
      fetchSchedules()
    } else {
      setSchedules([])
    }
  }, [loggedInUser, route])

  const renderSchedule = ({ item }) => {
    return (
      <ImageCard
        imageUri={scheduleIcon}
        title={item.name}
      >
        <View style={styles.row}>
          <TextSemiBold>Start time: </TextSemiBold>
          <TextRegular style={{ color: GlobalStyles.brandGreenTap, fontSize: 12 }}>{item.startTime}</TextRegular>
        </View>
        <View style={styles.row}>
          <TextSemiBold>End time: </TextSemiBold>
          <TextRegular style={{ color: GlobalStyles.brandPrimary, fontSize: 12 }}>{item.endTime}</TextRegular>
        </View>
        <View style={[styles.row, { justifyContent: 'flex-end' }]}>
          <TextSemiBold style={{ color: GlobalStyles.brandSecondary, fontSize: 15 }}>{item.products.length}</TextSemiBold>
          <TextSemiBold style={{ color: GlobalStyles.brandSecondary }}> products asociated</TextSemiBold>
        </View>

            <View style={styles.actionButtonsContainer}>
            <Pressable
              onPress={() => navigation.navigate('EditScheduleScreen', { schedule: item })
              }
              style={({ pressed }) => [
                {
                  backgroundColor: pressed
                    ? GlobalStyles.brandBlueTap
                    : GlobalStyles.brandBlue
                },
                styles.actionButton
              ]}>
            <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
              <MaterialCommunityIcons name='pencil' color={'white'} size={20}/>
              <TextRegular textStyle={styles.text}>
                Edit
              </TextRegular>
            </View>
          </Pressable>

          <Pressable
              onPress={() => { setScheduleToBeRemoved(item) }}
              style={({ pressed }) => [
                {
                  backgroundColor: pressed
                    ? GlobalStyles.brandPrimaryTap
                    : GlobalStyles.brandPrimary
                },
                styles.actionButton
              ]}>
            <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
              <MaterialCommunityIcons name='delete' color={'white'} size={20}/>
              <TextRegular textStyle={styles.text}>
                Delete
              </TextRegular>
            </View>
          </Pressable>
          </View>
      </ImageCard>
    )
  }

  const renderEmptySchedulesList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        No schedules were retreived. Either you are not logged in or the restaurant has no schedules yet.
      </TextRegular>
    )
  }

  const renderHeader = () => {
    return (
      <>
      {loggedInUser &&
      <Pressable
        onPress={() => navigation.navigate('CreateScheduleScreen', { id: route.params.id })
        }
        style={({ pressed }) => [
          {
            backgroundColor: pressed
              ? GlobalStyles.brandGreenTap
              : GlobalStyles.brandGreen
          },
          styles.button
        ]}>
        <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
          <MaterialCommunityIcons name='plus-circle' color={'white'} size={20}/>
          <TextRegular textStyle={styles.text}>
            Create schedule
          </TextRegular>
        </View>
      </Pressable>
    }
    </>
    )
  }

  const fetchSchedules = async () => {
    const fetchedSchedules = await getRestaurantSchedules(route.params.id)
    setSchedules(fetchedSchedules)
    console.log(schedules)
  }

  const remove = async (schedule) => {
    await removeSchedule(route.params.id, schedule.id)
    setScheduleToBeRemoved(null)
    fetchSchedules()
  }

  return (
    <>
      <FlatList
        style={styles.container}
        data={schedules}
        renderItem={renderSchedule}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptySchedulesList}
      />
      <DeleteModal
        isVisible={scheduleToBeRemoved !== null}
        onCancel={() => setScheduleToBeRemoved(null)}
        onConfirm={() => remove(scheduleToBeRemoved)}>
          <TextRegular>Are you sure you want to remove this schedule?</TextRegular>
      </DeleteModal>
    </>

  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },
  button: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    width: '80%'
  },
  actionButton: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    margin: '1%',
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'column',
    width: '50%'
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    bottom: 5,
    position: 'absolute',
    width: '90%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    marginLeft: 5
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  productsAssociatedText: {
    textAlign: 'right',
    color: GlobalStyles.brandSecondary
  }
})
