import {Body, Controller, Delete, Get, Param, Put, UseGuards} from "@nestjs/common";
import {VERSION_1_URI} from "../utils/versionts";
import {ApiBearerAuth, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
import {AuthGuard} from "../authentication/auth.guard"
import {EventIdResponse} from "./dto/event-id-response";
import {SingleEventResponse} from "./dto/single-event-response";
import {EventsService} from "./events.service";
import {UpdateEventRequest} from "./dto/update-event-request";
import {EventModel} from "./models/event.model";
import {mapDateTimesToIso} from "../utils/map-date-times-to-iso";
import {ApiImplicitParam} from "@nestjs/swagger/dist/decorators/api-implicit-param.decorator";
import FindByIdParams from "../dto/find-by-id-params";
import {eventModelToEventDTO} from "./dto/eventModelToEventDTO";
import UpsertEventAdminMetadataRequest from "./dto/upsert-event-admin-metadata-request";
import {EventAdminMetadataListResponse, EventAdminMetadataSingleResponse} from "./dto/event-admin-metadata-response";

@Controller(`${VERSION_1_URI}/authenticated/events`)
@UseGuards(AuthGuard)
@ApiTags('events -- authenticated')
@ApiBearerAuth()
@ApiResponse({status: 403, description: "Forbidden"})
export default class EventsAuthenticatedController {

    constructor(private readonly eventsService: EventsService){}

    // this probably shouldn't be needed long term, we should just fetch this with the event
    @Get('/admin-metadata')
    @ApiOperation({ summary: 'Get all admin metadata for all events' })
    getEventAdminMetadata(): Promise<EventAdminMetadataListResponse> {
        return this.eventsService.getAllEventMetaData()
            .then((eventAdminMetadata) =>
                new EventAdminMetadataListResponse({ eventAdminMetadata }))
    }

    @Get("/:id")
    @ApiOperation({summary: 'Get a single event with no filters applied (authenticated only)'})
    @ApiResponse({
        status: 200,
        description: 'get single event',
    })
    getById(@Param() params: { id: string }): Promise<SingleEventResponse> {
        const id = params.id

        return this.eventsService.findById(id)
            .then(eventModelToEventDTO)
            .then(event => ({ event, status: 'success' }))
    }

    @Put(':id')
    @ApiOperation({summary: 'Update fields on an existing event'})
    @ApiImplicitParam({name: 'id', type: String})
    updateEvent(
        @Param() params: FindByIdParams,
        @Body() updatedValues: UpdateEventRequest
    ): Promise<EventModel> {
        const id = params.id;

        const eventWithDateTimesInISOFormat = mapDateTimesToIso<UpdateEventRequest>(updatedValues, UpdateEventRequest)

        return this.eventsService.update(id, eventWithDateTimesInISOFormat)
            .then(response => response.updatedEntities[0]);
    }

    @Put('/verify/:id')
    @ApiOperation({summary: 'Verify the event, making it visible to the public'})
    @ApiImplicitParam({name: 'id', type: String})
    verifyEvent(@Param() params: FindByIdParams): Promise<EventModel> {
        const id = params.id;

        return this.eventsService.update(id, {verified: true})
            .then(response => response.updatedEntities[0]);
    }

    @Delete(':id')
    @ApiOperation({summary: 'Delete the event'})
    @ApiImplicitParam({name: 'id', type: String})
    deleteEvent(@Param() params: FindByIdParams): Promise<EventIdResponse> {
        const id = params.id;

        return this.eventsService.delete(id)
            .then(response => ({ id, status: 'success' }))
    }

    @Put(':id/admin-metadata')
    @ApiOperation({ summary: 'Set admin metadata information for an event' })
    @ApiImplicitParam({ name: 'id', type: String })
    upsertAdminMetadata(
        @Param() { id }: FindByIdParams,
        @Body() updatedState: UpsertEventAdminMetadataRequest
    ): Promise<EventAdminMetadataSingleResponse> {
        return this.eventsService.upsertEventMetadata(id, updatedState)
            .then((eventAdminMetadata) =>
                new EventAdminMetadataSingleResponse({ eventAdminMetadata }))
    }
}
