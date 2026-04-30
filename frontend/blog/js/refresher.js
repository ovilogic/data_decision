
const today = new Date()

const dateReconstructed = new Date('2024-05-09T12:36:19.000Z')
if (today < dateReconstructed) {
    console.log('today is older ?')
}
else {
    console.log('old post', dateReconstructed, (today - dateReconstructed)
/ (1000 * 60 * 60 * 24))
}
