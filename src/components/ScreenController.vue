<template>
    <div class="container">
        <p class="name">{{ name }}</p>
        <p class="obsObjectName">{{ obsInfo.obsObjectName }}</p>
    </div>
</template>
<style scoped lang="stylus">
.container
    display flex
    flex-direction column
    align-item  middle
    justify-content center
    width 100px
    height 100px
    margin 2px
    border: 1px solid black
    border-radius 1rem
    .name
        text-align center
        font-size 2rem

    .obsObjectName
        text-align center


        
        
    
</style>
<script>
export default {
    props:['name','obsInfo'],
    data() {
        return {
        }
    }
}
</script>