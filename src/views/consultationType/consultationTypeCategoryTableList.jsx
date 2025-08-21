import { Card } from "../../components/ui";

const ConsultationTypeCategoryTableList = ({data}) => {
    return(
        <div>
            {data?.map((category) => {
                return(
                    <Card>
                        category
                    </Card>
                )
            })}
        </div>
    )
}

export default ConsultationTypeCategoryTableList;